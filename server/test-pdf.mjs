import { createRequire } from "module";
const require = createRequire(import.meta.url);

const pdf = require("pdf-parse");
console.log("Type:", typeof pdf);
console.log("Keys:", Object.keys(pdf));
console.log("Full object:", pdf);

// Test with a simple PDF buffer
const buf = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF", "utf8");

if (typeof pdf === "function") {
  pdf(buf).then(d => console.log("Parse result:", d)).catch(e => console.log("Parse error:", e.message));
} else if (pdf.default && typeof pdf.default === "function") {
  pdf.default(buf).then(d => console.log("Parse result:", d)).catch(e => console.log("Parse error:", e.message));
} else if (pdf.PDFParse) {
  const parser = new pdf.PDFParse();
  parser.parseBuffer(buf, (err, data) => {
    if (err) console.log("Callback error:", err.message);
    else console.log("Callback result:", data);
  });
}
