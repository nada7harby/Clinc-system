const fs = require("fs");
const path = require("path");
const https = require("https");

const root = process.cwd();
const enPath = path.join(root, "src", "locales", "en", "common.json");
const arPath = path.join(root, "src", "locales", "ar", "common.json");
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const cachePath = path.join(root, "scripts", ".translate-ar-cache.json");
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};

const manual = {
  "MediCore Clinic": "عيادة ميدي كور",
  MediCore: "ميدي كور",
  Login: "تسجيل الدخول",
  Register: "إنشاء حساب",
  Dashboard: "لوحة التحكم",
  "Main Menu": "القائمة الرئيسية",
  "Sign Out": "تسجيل الخروج",
  "Inventory ERP": "نظام المخزون",
  "HIPAA Security Logs": "سجلات أمان HIPAA",
  "Book Now": "احجز الآن",
  "Book Appointment": "حجز موعد",
  "Call Emergency (911)": "اتصل بالطوارئ (911)",
  Cancel: "إلغاء",
  Save: "حفظ",
  Export: "تصدير",
  Search: "بحث",
  "No records found.": "لا توجد سجلات.",
};

function leaves(node, list = []) {
  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === "object" && !Array.isArray(value)) leaves(value, list);
    else if (typeof value === "string") list.push(value);
  }
  return list;
}

function mask(text) {
  const tokens = [];
  const masked = text.replace(/\{\{[^}]+\}\}/g, (match) => {
    const token = `__TOKEN_${tokens.length}__`;
    tokens.push([token, match]);
    return token;
  });
  return { masked, tokens };
}

function unmask(text, tokens) {
  let result = text;
  for (const [token, original] of tokens) {
    result = result.replaceAll(token, original);
  }
  return result;
}

function translate(text) {
  if (!text.trim()) return Promise.resolve(text);
  if (manual[text]) return Promise.resolve(manual[text]);
  if (cache[text]) return Promise.resolve(cache[text]);

  const { masked, tokens } = mask(text);
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=" +
    encodeURIComponent(masked);

  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(body);
            const translated = parsed[0].map((part) => part[0]).join("");
            const finalValue = unmask(translated, tokens);
            cache[text] = finalValue;
            resolve(finalValue);
          } catch {
            resolve(text);
          }
        });
      })
      .on("error", () => resolve(text));
  });
}

async function translateObject(node) {
  const result = Array.isArray(node) ? [] : {};
  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = await translateObject(value);
    } else if (typeof value === "string") {
      result[key] = await translate(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

(async () => {
  console.log(`Translating ${leaves(en).length} strings to Arabic...`);
  const ar = await translateObject(en);
  fs.writeFileSync(arPath, `${JSON.stringify(ar, null, 2)}\n`, "utf8");
  fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
})();
