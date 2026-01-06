const fs = require("fs");
const pdfLib = require("pdf-parse");

const pdfPath =
  "C:\\Users\\dvisr\\Downloads\\Mudralaya_Fintech_Detailed_PRD.pdf";

console.log("Type of pdfLib:", typeof pdfLib);
// console.log('Keys:', Object.keys(pdfLib));

let pdf = pdfLib;
// Handle different export styles if needed
if (typeof pdfLib !== "function" && pdfLib.default) {
  pdf = pdfLib.default;
}

if (fs.existsSync(pdfPath)) {
  const dataBuffer = fs.readFileSync(pdfPath);

  // Try calling it, catching specific error if it's still not a function
  try {
    pdf(dataBuffer)
      .then(function (data) {
        console.log(data.text);
      })
      .catch((err) => {
        console.error("Error parsing PDF:", err);
      });
  } catch (e) {
    console.error("Failed to call pdf function:", e);
  }
} else {
  console.error("File not found at:", pdfPath);
}
