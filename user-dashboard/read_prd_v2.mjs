import fs from "fs";
import pdf from "pdf-parse";

const pdfPath =
  "C:\\Users\\dvisr\\Downloads\\Mudralaya_Fintech_Detailed_PRD.pdf";

console.log("PDF Import:", pdf);

if (fs.existsSync(pdfPath)) {
  const dataBuffer = fs.readFileSync(pdfPath);
  // @ts-ignore
  const parseFunc = pdf.default || pdf;

  if (typeof parseFunc === "function") {
    parseFunc(dataBuffer)
      .then(function (data) {
        console.log(data.text);
      })
      .catch((err) => console.error(err));
  } else {
    console.log("PDF export is not a function:", parseFunc);
  }
}
