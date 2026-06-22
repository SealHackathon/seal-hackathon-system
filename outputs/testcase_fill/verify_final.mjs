import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
import fs from "node:fs/promises";

const outputDir = "E:/HSF_302_SWP/SWP391_HACKATHON/outputs/testcase_fill";
const input = await FileBlob.load(`${outputDir}/SE1907_SE193179_Le_Trung_Kien_ST_filled.xlsx`);
const workbook = await SpreadsheetFile.importXlsx(input);

for (const [sheetId, range] of [
  ["Feature 1", "A22:O24"],
  ["Feature 2", "A21:O23"],
  ["Performance", "A17:O19"],
  ["Test Cases", "B18:F20"],
  ["Test Statistics", "B10:H14"],
]) {
  const values = await workbook.inspect({
    kind: "region",
    sheetId,
    range,
    maxChars: 8000,
    tableMaxRows: 10,
    tableMaxCols: 15,
    tableMaxCellChars: 180,
  });
  await fs.writeFile(`${outputDir}/verify_${sheetId.replace(/[\\/:*?"<>|]/g, "_")}.ndjson`, values.ndjson);
  const styles = await workbook.inspect({
    kind: "computedStyle",
    sheetId,
    range,
    maxChars: 8000,
  });
  await fs.writeFile(`${outputDir}/style_${sheetId.replace(/[\\/:*?"<>|]/g, "_")}.ndjson`, styles.ndjson);
}

console.log("verify ok");
