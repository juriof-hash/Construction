function doPost(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const API_SECRET = props.getProperty('API_SECRET');
    
    // [방어] POST body 파싱
    const body = JSON.parse(e.postData.contents);
    
    // ① [방어] secret 인증: 불일치 시 forbidden 반환. 읽기/쓰기 모두 적용
    if (body.secret !== API_SECRET) {
      return ContentService.createTextOutput(JSON.stringify({ status: "forbidden" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // ② [방어] action 분기 검증
    if (body.action === 'read') {
      const data = sheet.getDataRange().getValues();
      const records = [];
      // 헤더 제외(인덱스 1부터)
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue;
        records.push({
          stage: String(row[0]),
          elapsedTime: Number(row[1]),
          userName: String(row[2]),
          // ⑥ [방어] 날짜 직렬화: 구글 시트가 날짜를 로컬 문자열로 자동 변환하는 버그를 방어
          timestamp: new Date(row[3]).toISOString()
        });
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: records }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else if (body.action === 'write') {
      // ③ [방어] write 시 필수 필드 검증: stage, elapsedTime, userName 세 필드가 존재해야 함
      if (!body.stage || body.elapsedTime === undefined || !body.userName) {
        return ContentService.createTextOutput(JSON.stringify({ status: "bad_request" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      const elapsedTime = Number(body.elapsedTime);
      // ④ [방어] 매크로 방어: elapsedTime < 2.0 이면 저장 거부
      if (elapsedTime < 2.0) {
        return ContentService.createTextOutput(JSON.stringify({ status: "bad_request" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // ⑤ [방어] 이름 새니타이징: 스프레드시트 인젝션 방어(기호 제거) 및 최대 20자 제한
      let safeUserName = String(body.userName).replace(/[=+\-@]/g, "");
      safeUserName = safeUserName.substring(0, 20);
      
      const timestamp = body.timestamp || new Date().toISOString();
      const safeStage = "'" + body.stage; // Prevent date parsing
      
      // 순서: stage(0), elapsedTime(1), userName(2), timestamp(3)
      sheet.appendRow([safeStage, elapsedTime, safeUserName, timestamp]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      // ② [방어] 그 외 action 값
      return ContentService.createTextOutput(JSON.stringify({ status: "bad_request" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
