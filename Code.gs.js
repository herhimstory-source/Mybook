/**
 * @OnlyCurrentDoc
 */

function doPost(e) {
  try {
    // 'MyBookshelf'라는 이름의 시트를 가져옵니다.
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MyBookshelf");
    
    // 시트가 없으면 새로 생성하고 헤더를 추가합니다.
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("MyBookshelf");
      sheet.appendRow(["ISBN", "Title", "Author", "Summary", "CompletionDate", "Quotes"]);
    }

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var isbnCol = headers.indexOf("ISBN") + 1;
    var titleCol = headers.indexOf("Title") + 1;
    var authorCol = headers.indexOf("Author") + 1;
    var summaryCol = headers.indexOf("Summary") + 1;
    var completionDateCol = headers.indexOf("CompletionDate") + 1;
    var quotesCol = headers.indexOf("Quotes") + 1;

    if (isbnCol === 0 || titleCol === 0 || authorCol === 0) {
      throw new Error("시트에서 'ISBN', 'Title', 'Author' 헤더를 찾을 수 없습니다.");
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
      var lookupIsbn = params.lookupIsbn;
      if (!lookupIsbn || lookupIsbn.trim() === '') {
         // lookupIsbn이 없는 경우, 새 ISBN을 기준으로 다시 시도하거나 새로 추가
         lookupIsbn = bookData.isbn; 
      }
      
      var data = sheet.getDataRange().getValues();
      var found = false;
      // 헤더를 제외하고 1부터 시작
      for (var i = 1; i < data.length; i++) {
        if (data[i][isbnCol - 1] == lookupIsbn) {
          var row = i + 1;
          sheet.getRange(row, titleCol).setValue(bookData.title);
          sheet.getRange(row, authorCol).setValue(bookData.author);
          sheet.getRange(row, isbnCol).setValue(bookData.isbn); // ISBN이 변경되었을 수도 있으므로 업데이트
          sheet.getRange(row, summaryCol).setValue(bookData.summary);
          sheet.getRange(row, completionDateCol).setValue(bookData.completionDate);
          if (quotesCol > 0) {
            sheet.getRange(row, quotesCol).setValue(bookData.quotes);
          }
          found = true;
          break;
        }
      }
      
      // 업데이트할 행을 찾지 못한 경우, 새 행으로 추가
      if (!found) {
         sheet.appendRow([bookData.isbn, bookData.title, bookData.author, bookData.summary, bookData.completionDate, bookData.quotes]);
      }

    } else { // 'add' 액션
      sheet.appendRow([bookData.isbn, bookData.title, bookData.author, bookData.summary, bookData.completionDate, bookData.quotes]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "action": action })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(error.toString());
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}