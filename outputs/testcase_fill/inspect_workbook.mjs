import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
import fs from "node:fs/promises";

const inputPath = "E:/HSF_302_SWP/SWP391_HACKATHON/outputs/testcase_fill/template_clean.xlsx";
const outputDir = "E:/HSF_302_SWP/SWP391_HACKATHON/outputs/testcase_fill";

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const summary = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 12000,
  tableMaxRows: 12,
  tableMaxCols: 16,
  tableMaxCellChars: 160,
});
await fs.writeFile(`${outputDir}/summary.ndjson`, summary.ndjson);

const sheets = await workbook.inspect({
  kind: "sheet",
  include: "id,name",
  maxChars: 4000,
});
await fs.writeFile(`${outputDir}/sheets.ndjson`, sheets.ndjson);

await fs.mkdir(outputDir, { recursive: true });
for (const sheet of workbook.worksheets.items) {
  const name = sheet.name;
  const safeName = name.replace(/[\\/:*?"<>|]/g, "_");
  const region = await workbook.inspect({
    kind: "region",
    sheetId: name,
    range: "A1:Z40",
    maxChars: 10000,
    tableMaxRows: 40,
    tableMaxCols: 26,
    tableMaxCellChars: 120,
  });
  await fs.writeFile(`${outputDir}/region_${safeName}.ndjson`, region.ndjson);
  try {
    const preview = await workbook.render({
      sheetName: name,
      range: "A1:Z40",
      scale: 1,
      format: "png",
    });
    await fs.writeFile(`${outputDir}/preview_${safeName}.png`, new Uint8Array(await preview.arrayBuffer()));
  } catch (error) {
    console.error(`Render failed for ${name}: ${error.message}`);
  }
}
