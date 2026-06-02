const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const root = process.cwd();
const srcRoot = path.join(root, "src");
const include = /\.(jsx|js)$/;
const ignoreDirs = new Set(["node_modules", "dist", ".git"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoreDirs.has(entry.name)) continue;
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

const strings = [];

for (const file of walk(srcRoot)) {
  const code = fs.readFileSync(file, "utf8");
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
      errorRecovery: true,
    });
  } catch (error) {
    console.error(`Parse failed: ${path.relative(root, file)}\n${error.message}`);
    continue;
  }

  const rel = path.relative(root, file).replace(/\\/g, "/");
  traverse(ast, {
    JSXText(nodePath) {
      const value = clean(nodePath.node.value);
      if (value && hasLetters(value)) {
        strings.push({ file: rel, type: "jsxText", value });
      }
    },
    JSXAttribute(nodePath) {
      const attr = nodePath.node.name?.name;
      if (!["placeholder", "title", "aria-label", "alt"].includes(attr)) return;
      const valueNode = nodePath.node.value;
      if (valueNode?.type === "StringLiteral") {
        const value = clean(valueNode.value);
        if (value && hasLetters(value)) strings.push({ file: rel, type: attr, value });
      }
    },
    CallExpression(nodePath) {
      const callee = nodePath.node.callee;
      const isToast =
        callee?.type === "MemberExpression" &&
        callee.object?.name === "toast" &&
        ["success", "error", "info", "warning"].includes(callee.property?.name);
      const isConfirm = callee?.type === "Identifier" && callee.name === "confirm";
      if (!isToast && !isConfirm) return;
      const first = nodePath.node.arguments[0];
      if (first?.type === "StringLiteral") {
        const value = clean(first.value);
        if (value && hasLetters(value)) strings.push({ file: rel, type: isToast ? "toast" : "confirm", value });
      }
    },
  });
}

const unique = [...new Map(strings.map((item) => [`${item.file}|${item.type}|${item.value}`, item])).values()];
console.log(JSON.stringify(unique, null, 2));
