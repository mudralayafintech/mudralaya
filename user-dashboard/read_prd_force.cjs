const fs = require("fs");
const PDFLib = require("pdf-parse");

const pdfPath =
  "C:\\Users\\dvisr\\Downloads\\Mudralaya_Fintech_Detailed_PRD.pdf";

console.log("PDFLib keys:", Object.keys(PDFLib));

if (fs.existsSync(pdfPath)) {
  const dataBuffer = fs.readFileSync(pdfPath);

  // Check if there's a default function concealed
  // console.log(PDFLib);

  // Try standard usage fallback
  // If it's the weird version, maybe it behaves like this:
  /*
    let parser = new PDFLib.PDFParse();
    // parser.parse(buffer)?
    */

  // Let's just try to log what PDFParse CLass is
  // console.log(PDFLib.PDFParse.prototype);

  // Actually, common issue: did I install 'pdf-parse' or something else?
  // I installed 'pdf-parse'.

  // Let's try to assume it's NOT the standard one and try the standard way one last time
  // BUT wrap it in a try-catch to try alternative

  try {
    if (typeof PDFLib === "function") {
      PDFLib(dataBuffer).then((data) => console.log(data.text));
    } else {
      // Maybe it's not the main export?
      console.log("Not a function. Trying alternatives...");
    }
  } catch (e) {
    console.log(e);
  }
} else {
  console.log("File not found");
}
