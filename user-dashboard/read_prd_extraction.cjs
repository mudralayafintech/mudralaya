const fs = require("fs");
const pdf = require("pdf-extraction");

const pdfPath =
  "C:\\Users\\dvisr\\Downloads\\Mudralaya_Fintech_Detailed_PRD.pdf";

if (fs.existsSync(pdfPath)) {
  const dataBuffer = fs.readFileSync(pdfPath);
  pdf(dataBuffer)
    .then(function (data) {
      console.log("PRD CONTENT START");
      console.log(data.text);
      console.log("PRD CONTENT END");
    })
    .catch((err) => {
      console.error("Error parsing PDF:", err);
    });
} else {
  console.error("File not found at:", pdfPath);
}
