/**
 * @OnlyCurrentDoc
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MyBookshelf");
    var HEADERS = ["ISBN", "Title", "Author", "Summary", "CompletionDate", "Quotes"];

    // 시트가 없으면 새로 생성하고 헤더를 추가합니다.
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("MyBookshelf");
      sheet.appendRow(HEADERS);
    }

    var currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // 헤더 순서에 맞춰 행 데이터 배열을 생성하는 함수
    function createRowArray(bookData) {
      var row = [];
      for (var i = 0; i < currentHeaders.length; i++) {
        switch (currentHeaders[i]) {
          case "ISBN":
            row[i] = bookData.isbn;
            break;
          case "Title":
            row[i] = bookData.title;
            break;
          case "Author":
            row[i] = bookData.author;
            break;
          case "Summary":
            row[i] = bookData.summary;
            break;
          case "CompletionDate":
            row[i] = bookData.completionDate;
            break;
          case "Quotes":
            row[i] = bookData.quotes;
            break;
          default:
            row[i] = ""; // 예기치 않은 추가 열은 빈 값으로 처리
        }
      }
      return row;
    }

    var isbnColIndex = currentHeaders.indexOf("ISBN");
    if (isbnColIndex === -1) {
      throw new Error("시트에서 'ISBN' 헤더를 찾을 수 없습니다.");
    }
    
    var params = e.parameter;
    var action = params.action;
    var bookData = {
      title: params.title,
      author: params.author,
      isbn: params.isbn,
      summary: params.summary,
      completionDate: params.completionDate,
      quotes: params.quotes // JSON string
    };

    if (action === 'update') {
      var lookupIsbn = params.lookupIsbn || bookData.isbn;
      var data = sheet.getDataRange().getValues();
      var foundRowIndex = -1;

      // 헤더를 제외하고 1부터 시작 (i=1)
      for (var i = 1; i < data.length; i++) {
        if (data[i][isbnColIndex] == lookupIsbn) {
          foundRowIndex = i + 1; // 실제 시트 행 번호
          break;
        }
      }
      
      var newRowData = createRowArray(bookData);

      if (foundRowIndex > -1) {
        // 기존 행 업데이트
        sheet.getRange(foundRowIndex, 1, 1, newRowData.length).setValues([newRowData]);
      } else {
        // 찾지 못한 경우 새 행으로 추가
        sheet.appendRow(newRowData);
      }
    } else { // 'add' 액션
      var newRowData = createRowArray(bookData);
      sheet.appendRow(newRowData);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "action": action })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(error.toString());
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
