const fs = require("fs");
const path = require("path");
const vm = require("vm");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");

const root = process.cwd();
const srcRoot = path.join(root, "src");
const localeRoot = path.join(srcRoot, "locales");
const include = /\.(jsx|js)$/;
const ignore = new Set(["node_modules", "dist", ".git", "locales"]);
const attrNames = new Set(["placeholder", "title", "aria-label", "alt"]);
const objectKeys = new Set([
  "title",
  "subtitle",
  "description",
  "desc",
  "label",
  "header",
  "emptyMessage",
  "placeholder",
  "message",
  "required",
  "defaultValue",
  "reviews",
  "role",
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignore.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (include.test(entry.name)) files.push(full);
  }
  return files;
}

function clean(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function hasLetters(value) {
  return /[A-Za-z\u0600-\u06FF]/.test(value);
}

function shouldTranslate(value) {
  const text = clean(value);
  if (!text || !hasLetters(text)) return false;
  if (text.length === 1) return false;
  if (/^(fa[A-Z]|http|\/|#|[A-Z0-9_-]+$)/.test(text)) return false;
  if (/^[\w.-]+@[\w.-]+$/.test(text)) return false;
  return true;
}

function camelPart(value) {
  return String(value)
    .replace(/[^A-Za-z0-9\u0600-\u06FF]+/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 7)
    .map((part, index) => {
      const safe = part.replace(/[^A-Za-z0-9]/g, "");
      if (!safe) return "";
      const lower = safe.toLowerCase();
      return index === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("") || "text";
}

function fileNamespace(file) {
  const rel = path.relative(srcRoot, file).replace(/\\/g, "/").replace(/\.(jsx|js)$/, "");
  return rel
    .split("/")
    .map((part) => camelPart(part))
    .join(".");
}

function setNested(object, key, value) {
  const parts = key.split(".");
  let node = object;
  for (let i = 0; i < parts.length - 1; i += 1) {
    node[parts[i]] ||= {};
    node = node[parts[i]];
  }
  node[parts[parts.length - 1]] = value;
}

function getExistingResources() {
  const indexPath = path.join(srcRoot, "i18n", "index.js");
  const code = fs.readFileSync(indexPath, "utf8");
  const match = code.match(/const resources = ([\s\S]*?);\s*const savedLang/);
  if (!match) return { en: { translation: {} }, ar: { translation: {} } };
  return vm.runInNewContext(`(${match[1]})`, {});
}

function hasUseTranslationImport(ast) {
  return ast.program.body.some(
    (node) =>
      node.type === "ImportDeclaration" &&
      node.source.value === "react-i18next" &&
      node.specifiers.some((specifier) => specifier.imported?.name === "useTranslation"),
  );
}

function addUseTranslationImport(ast) {
  if (hasUseTranslationImport(ast)) return;
  const importNode = t.importDeclaration(
    [t.importSpecifier(t.identifier("useTranslation"), t.identifier("useTranslation"))],
    t.stringLiteral("react-i18next"),
  );
  const lastImportIndex = ast.program.body.findLastIndex((node) => node.type === "ImportDeclaration");
  ast.program.body.splice(lastImportIndex + 1, 0, importNode);
}

function topLevelFunctionPath(pathRef) {
  let current = pathRef;
  let candidate = null;
  while (current) {
    if (
      current.isFunctionDeclaration() ||
      current.isFunctionExpression() ||
      current.isArrowFunctionExpression()
    ) {
      candidate = current;
    }
    current = current.parentPath;
  }
  return candidate;
}

function ensureHook(functionPath) {
  if (!functionPath?.node?.body || functionPath.node.body.type !== "BlockStatement") return;
  if (functionPath.scope.hasBinding("t")) return;
  const declaration = t.variableDeclaration("const", [
    t.variableDeclarator(
      t.objectPattern([t.objectProperty(t.identifier("t"), t.identifier("t"), false, true)]),
      t.callExpression(t.identifier("useTranslation"), []),
    ),
  ]);
  functionPath.node.body.body.unshift(declaration);
}

function isAlreadyTCall(pathRef) {
  const parent = pathRef.parentPath;
  return parent?.isCallExpression() && parent.node.callee?.name === "t";
}

const resources = getExistingResources();
const en = resources.en?.translation || {};
const generated = {};
const usedKeys = new Set();

function makeKey(file, value) {
  const namespace = fileNamespace(file);
  const base = `${namespace}.${camelPart(value)}`;
  let key = base;
  let count = 2;
  while (usedKeys.has(key)) {
    key = `${base}${count}`;
    count += 1;
  }
  usedKeys.add(key);
  setNested(generated, key, clean(value));
  return key;
}

const files = walk(srcRoot).filter((file) => !file.endsWith(path.join("i18n", "index.js")));

for (const file of files) {
  const code = fs.readFileSync(file, "utf8");
  let ast;
  try {
    ast = parser.parse(code, { sourceType: "module", plugins: ["jsx"] });
  } catch {
    continue;
  }

  const functionsNeedingHook = new Set();
  let changed = false;

  function translatePath(pathRef, value, replace) {
    if (!shouldTranslate(value) || isAlreadyTCall(pathRef)) return;
    const fn = topLevelFunctionPath(pathRef);
    if (!fn) return;
    const key = makeKey(file, value);
    replace(t.callExpression(t.identifier("t"), [t.stringLiteral(key)]));
    functionsNeedingHook.add(fn);
    changed = true;
  }

  traverse(ast, {
    JSXText(pathRef) {
      const value = clean(pathRef.node.value);
      translatePath(pathRef, value, (call) => {
        pathRef.replaceWith(t.jsxExpressionContainer(call));
      });
    },
    JSXAttribute(pathRef) {
      const attr = pathRef.node.name?.name;
      if (!attrNames.has(attr)) return;
      const valueNode = pathRef.node.value;
      if (valueNode?.type !== "StringLiteral") return;
      translatePath(pathRef, valueNode.value, (call) => {
        pathRef.node.value = t.jsxExpressionContainer(call);
      });
    },
    CallExpression(pathRef) {
      const callee = pathRef.node.callee;
      const isToast =
        callee?.type === "MemberExpression" &&
        callee.object?.name === "toast" &&
        ["success", "error", "info", "warning"].includes(callee.property?.name);
      const isConfirm = callee?.type === "Identifier" && callee.name === "confirm";
      if (!isToast && !isConfirm) return;
      const first = pathRef.node.arguments[0];
      if (first?.type !== "StringLiteral") return;
      translatePath(pathRef, first.value, (call) => {
        pathRef.node.arguments[0] = call;
      });
    },
    ObjectProperty(pathRef) {
      const keyNode = pathRef.node.key;
      const name = keyNode.type === "Identifier" ? keyNode.name : keyNode.value;
      if (!objectKeys.has(name)) return;
      const valueNode = pathRef.node.value;
      if (valueNode?.type !== "StringLiteral") return;
      translatePath(pathRef, valueNode.value, (call) => {
        pathRef.node.value = call;
      });
    },
  });

  if (changed) {
    addUseTranslationImport(ast);
    for (const fn of functionsNeedingHook) ensureHook(fn);
    fs.writeFileSync(file, `${generate(ast, { retainLines: false }).code}\n`);
  }
}

function mergeDeep(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      target[key] ||= {};
      mergeDeep(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

fs.mkdirSync(path.join(localeRoot, "en"), { recursive: true });
fs.mkdirSync(path.join(localeRoot, "ar"), { recursive: true });
fs.writeFileSync(
  path.join(localeRoot, "en", "common.json"),
  `${JSON.stringify(mergeDeep(en, generated), null, 2)}\n`,
);
fs.writeFileSync(
  path.join(localeRoot, "ar", "common.json"),
  `${JSON.stringify(mergeDeep({}, generated), null, 2)}\n`,
);
