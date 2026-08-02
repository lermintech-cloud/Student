export const GAS_SCRIPT_CODE = `/**
 * =========================================================================
 * โรงเรียนบ้านไร่ - Chibi Cute School Gradebook Google Apps Script Connector
 * =========================================================================
 * วิธีติดตั้ง:
 * 1. เปิด Google Sheets ใหม่ หรือชีตที่ต้องการใช้งาน
 * 2. คลิกเมนู ส่วนขยาย (Extensions) -> Apps Script
 * 3. วางโค้ดทั้งหมดนี้ลงไป (แทนที่โค้ดเดิมในไฟล์ Code.gs)
 * 4. กดบันทึก (Ctrl + S หรือ Cmd + S)
 * 5. คลิกที่เมนู การทำให้ใช้งานได้ (Deploy) -> การทำให้ใช้งานได้รายการใหม่ (New deployment)
 * 6. เลือกประเภท: เว็บแอป (Web app)
 * 7. ตั้งค่าผู้มีสิทธิ์เข้าถึง (Who has access): "ทุกคน (Anyone)" -> กด Deploy
 * 8. คัดลอก "เว็บแอป URL (Web app URL)" มาใส่ในระบบโรงเรียนบ้านไร่
 * =========================================================================
 */

function setupChibiGradebookSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. ชีต Students (นักเรียน)
  let stuSheet = ss.getSheetByName("Students");
  if (!stuSheet) {
    stuSheet = ss.insertSheet("Students");
    stuSheet.appendRow(["ID", "Code", "Title", "FirstName", "LastName", "Nickname", "Gender", "ClassLevel", "Room", "Status", "Note"]);
    styleHeader(stuSheet, "#a7d8ff", "#001e2f");
  }

  // 2. ชีต Subjects (รายวิชา)
  let subSheet = ss.getSheetByName("Subjects");
  if (!subSheet) {
    subSheet = ss.insertSheet("Subjects");
    subSheet.appendRow(["ID", "Code", "Name", "ClassLevel", "DefaultMaxScore"]);
    styleHeader(subSheet, "#ffd9df", "#330f19");
  }

  // 3. ชีต Assignments (งานที่มอบหมาย)
  let assSheet = ss.getSheetByName("Assignments");
  if (!assSheet) {
    assSheet = ss.insertSheet("Assignments");
    assSheet.appendRow(["ID", "SubjectID", "ClassLevel", "Title", "Description", "MaxScore", "DueDate", "Category"]);
    styleHeader(assSheet, "#aef2c2", "#00210f");
  }

  // 4. ชีต Grades (คะแนน)
  let grdSheet = ss.getSheetByName("Grades");
  if (!grdSheet) {
    grdSheet = ss.insertSheet("Grades");
    grdSheet.appendRow(["ID", "StudentID", "AssignmentID", "Score", "IsCompleted", "Note", "UpdatedAt"]);
    styleHeader(grdSheet, "#c9e6ff", "#001e2f");
  }

  return "ตั้งค่าชีตเรียบร้อยแล้ว!";
}

function styleHeader(sheet, bgColor, fontColor) {
  const range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setBackground(bgColor);
  range.setFontColor(fontColor);
  range.setFontWeight("bold");
  sheet.setFrozenRows(1);
}

/**
 * ดึงข้อมูลทั้งหมดจาก Google Sheets
 */
function doGet(e) {
  setupChibiGradebookSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const data = {
    status: "success",
    timestamp: new Date().toISOString(),
    spreadsheetId: ss.getId(),
    students: getSheetDataAsObjects(ss.getSheetByName("Students")),
    subjects: getSheetDataAsObjects(ss.getSheetByName("Subjects")),
    assignments: getSheetDataAsObjects(ss.getSheetByName("Assignments")),
    grades: getSheetDataAsObjects(ss.getSheetByName("Grades"))
  };

  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * บันทึกหรืออัปเดตข้อมูลจากระบบ Chibi Gradebook
 */
function doPost(e) {
  try {
    setupChibiGradebookSheets();
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action || 'sync_all';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'sync_all' || action === 'push') {
      if (payload.students) saveObjectsToSheet(ss.getSheetByName("Students"), payload.students, [
        "id", "code", "title", "firstName", "lastName", "nickname", "gender", "classLevel", "room", "status", "note"
      ]);
      if (payload.subjects) saveObjectsToSheet(ss.getSheetByName("Subjects"), payload.subjects, [
        "id", "code", "name", "classLevel", "defaultMaxScore"
      ]);
      if (payload.assignments) saveObjectsToSheet(ss.getSheetByName("Assignments"), payload.assignments, [
        "id", "subjectId", "classLevel", "title", "description", "maxScore", "dueDate", "category"
      ]);
      if (payload.grades) saveObjectsToSheet(ss.getSheetByName("Grades"), payload.grades, [
        "id", "studentId", "assignmentId", "score", "isCompleted", "note", "updatedAt"
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "อัปเดตข้อมูลใน Google Sheets เรียบร้อยแล้ว",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheetDataAsObjects(sheet) {
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values[0];
  const results = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j].toString().charAt(0).toLowerCase() + headers[j].toString().slice(1);
      obj[key] = row[j];
    }
    results.push(obj);
  }
  return results;
}

function saveObjectsToSheet(sheet, items, keys) {
  if (!sheet || !items) return;
  sheet.clear();
  // Headers
  const headers = keys.map(k => k.charAt(0).toUpperCase() + k.slice(1));
  sheet.appendRow(headers);
  styleHeader(sheet, "#a7d8ff", "#001e2f");

  const rows = items.map(item => {
    return keys.map(k => {
      const val = item[k];
      return val === undefined || val === null ? "" : val;
    });
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, keys.length).setValues(rows);
  }
}
`;
