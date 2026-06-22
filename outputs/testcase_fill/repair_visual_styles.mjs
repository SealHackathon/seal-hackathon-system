import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
import fs from "node:fs/promises";

const outputDir = "E:/HSF_302_SWP/SWP391_HACKATHON/outputs/testcase_fill";
const input = await FileBlob.load(`${outputDir}/SE1907_SE193179_Le_Trung_Kien_ST_filled.xlsx`);
const workbook = await SpreadsheetFile.importXlsx(input);

function styleAddedCases(sheetName, groupRow, firstCaseRow, lastCaseRow) {
  const sheet = workbook.worksheets.getItem(sheetName);
  sheet.getRange(`A${groupRow}:O${groupRow}`).format = {
    font: { bold: true, color: "#C65911" },
    fill: "#000000",
    wrapText: true,
  };
  sheet.getRange(`A${firstCaseRow}:O${lastCaseRow}`).format = {
    font: { color: "#00B050", italic: true },
    fill: "#000000",
    wrapText: true,
    verticalAlignment: "top",
  };
  sheet.getRange(`A${firstCaseRow}:O${lastCaseRow}`).format.rowHeightPx = 92;
}

styleAddedCases("Feature 1", 22, 23, 24);
styleAddedCases("Feature 2", 21, 22, 23);
styleAddedCases("Performance", 17, 18, 19);

const testCases = workbook.worksheets.getItem("Test Cases");
testCases.getRange("B18:F20").format = {
  font: { color: "#00B050", italic: true },
  fill: "#000000",
  wrapText: true,
  verticalAlignment: "top",
};
testCases.getRange("B18:F20").format.rowHeightPx = 38;

const statistics = workbook.worksheets.getItem("Test Statistics");
statistics.getRange("B11:H13").format = {
  font: { color: "#00B050", italic: true },
  fill: "#000000",
};
statistics.getRange("B14:H14").format = {
  font: { color: "#FFFFFF", bold: true },
  fill: "#000000",
};

for (const sheetName of ["Feature 1", "Feature 2", "Performance", "Test Cases", "Test Statistics"]) {
  const preview = await workbook.render({ sheetName, range: "A1:R30", scale: 1, format: "png" });
  await fs.writeFile(`${outputDir}/final2_${sheetName.replace(/[\\/:*?"<>|]/g, "_")}.png`, new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${outputDir}/SE1907_SE193179_Le_Trung_Kien_ST_filled.xlsx`);
console.log(`${outputDir}/SE1907_SE193179_Le_Trung_Kien_ST_filled.xlsx`);
