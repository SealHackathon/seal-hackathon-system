import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
import fs from "node:fs/promises";

const outputDir = "E:/HSF_302_SWP/SWP391_HACKATHON/outputs/testcase_fill";
const inputPath = `${outputDir}/template_clean.xlsx`;
const outputPath = `${outputDir}/SE1907_SE193179_Le_Trung_Kien_ST_filled.xlsx`;

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const pendingCells = ["Pending", null, null, "Pending", null, null, "Pending", null, null, null];

function row(tcId, description, procedure, expected, preconditions) {
  return [tcId, description, procedure, expected, preconditions, ...pendingCells];
}

function copyRowStyle(sheet, sourceRow, targetRow, rows = 1) {
  sheet.getRange(`A${sourceRow}:O${sourceRow + rows - 1}`).copyTo(
    sheet.getRange(`A${targetRow}:O${targetRow + rows - 1}`),
    "formats",
  );
}

function writeGroup(sheet, startRow, title, rows) {
  copyRowStyle(sheet, 18, startRow);
  sheet.getRange(`A${startRow}:O${startRow}`).values = [[title, null, null, null, null, null, null, null, null, null, null, null, null, null, null]];
  copyRowStyle(sheet, 21, startRow + 1, rows.length);
  sheet.getRange(`A${startRow + 1}:O${startRow + rows.length}`).values = rows;
}

const feature1 = workbook.worksheets.getItem("Feature 1");
writeGroup(feature1, 22, "Conflict & Room Change", [
  row(
    "TC019",
    "Verify system prevents booking when selected slot overlaps an approved meeting",
    "1. Log in with daibieu1@tempmail.id.vn\n2. Select a room and time slot that already has an approved meeting\n3. Fill all required meeting information\n4. Click Submit Request",
    "System prevents submission and shows a conflict message; no new booking request is created for the overlapping slot",
    "There is an approved meeting in the same room and time slot",
  ),
  row(
    "TC020",
    "Verify Manager changes meeting room after approval without changing approved meeting content",
    "1. Log in with thuky\n2. Open an approved meeting\n3. Choose Change Room\n4. Select an equivalent available room\n5. Confirm change",
    "Meeting room is updated; meeting name, chairperson, secretary, content, delegates and time remain unchanged; related users receive notification",
    "There is an approved meeting and an equivalent room is available",
  ),
]);
feature1.getRange("B4").values = [["10"]];
feature1.getRange("E6:E8").values = [["10"], ["10"], ["10"]];

const feature2 = workbook.worksheets.getItem("Feature 2");
writeGroup(feature2, 21, "Connectivity & Logistics", [
  row(
    "TC021",
    "Verify Display App reconnects and refreshes room status after WiFi interruption",
    "1. Ensure tablet is showing current room status\n2. Disconnect tablet WiFi for 1 minute\n3. Reconnect WiFi\n4. Observe displayed room status",
    "Display App reconnects automatically and refreshes to the latest room status without manual reload",
    "Display App tablet is assigned to a room and WebSocket/realtime service is available",
  ),
  row(
    "TC022",
    "Verify Logistics staff receives preparation task and confirms room setup",
    "1. User creates a meeting with 20 delegates and nameplate requirement\n2. Manager approves the meeting\n3. Log in as logistics staff\n4. Open preparation task\n5. Mark preparation as completed",
    "Logistics staff receives notification with room, time, delegate count and nameplate list; task status changes to Completed after confirmation",
    "Meeting request includes logistics information and delegate nameplate list",
  ),
]);
feature2.getRange("B4").values = [["9"]];
feature2.getRange("E6:E8").values = [["9"], ["9"], ["9"]];

const performance = workbook.worksheets.getItem("Performance");
writeGroup(performance, 17, "Attendance & Report Filters", [
  row(
    "TC023",
    "Verify attendance API marks delegate as present after fingerprint/face recognition",
    "1. Prepare an approved meeting with delegate list\n2. Send attendance payload from fingerprint/face recognition system through API Gateway\n3. Open meeting attendance list",
    "Matched delegate is automatically marked as Present and attendance data is available for reporting",
    "Attendance device/API payload contains a valid delegate identifier for the meeting",
  ),
  row(
    "TC024",
    "Verify report filter supports room, meeting type and chairperson conditions",
    "1. Log in with thuky\n2. Navigate to Reports & Statistics\n3. Select a custom date range\n4. Apply filters by room, meeting type and chairperson\n5. View/export result",
    "Report displays only meetings matching all selected filters; exported file keeps the same filtered data",
    "System has meeting data across multiple rooms, meeting types and chairpersons",
  ),
]);
performance.getRange("B4").values = [["5"]];
performance.getRange("E6:E8").values = [["5"], ["5"], ["5"]];

const testCases = workbook.worksheets.getItem("Test Cases");
testCases.getRange("B18:F23").copyFrom(testCases.getRange("B12:F17"), "formats");
testCases.getRange("B18:F23").values = [
  ["10", "Conflict & Room Change", "Feature 1", "Verify overlapping slot validation and approved meeting room change workflow", "Approved meeting/available equivalent room data exists"],
  ["11", "Connectivity & Logistics", "Feature 2", "Verify tablet reconnect behavior and logistics preparation confirmation", "Display App and logistics account are available"],
  ["12", "Attendance & Report Filters", "Performance", "Verify attendance API update and advanced report filters", "Attendance API and report sample data are available"],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
];

const statistics = workbook.worksheets.getItem("Test Statistics");
statistics.getRange("F11:H14").values = [
  ["10", "0", "10"],
  ["9", "0", "9"],
  ["5", "0", "5"],
  ["24", "0", "24"],
];
statistics.getRange("D11:E14").values = [
  ["0", "0"],
  ["0", "0"],
  ["0", "0"],
  ["0", "0"],
];

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  maxChars: 3000,
});
await fs.writeFile(`${outputDir}/final_error_scan.ndjson`, errors.ndjson);

for (const sheetName of ["Feature 1", "Feature 2", "Performance", "Test Cases", "Test Statistics"]) {
  const preview = await workbook.render({ sheetName, range: "A1:R30", scale: 1, format: "png" });
  await fs.writeFile(`${outputDir}/final_${sheetName.replace(/[\\/:*?"<>|]/g, "_")}.png`, new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(outputPath);
