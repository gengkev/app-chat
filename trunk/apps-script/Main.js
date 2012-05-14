function updateStatuses() {
  // This function will run approx every 5 minutes.
  // We want to make users idle if they have not been
  // online for 10 minutes (between 7.5-12.5)
  
  // No implement yet sur!
  
  
}
function arrayIndexOf(array,value) {
  for (var i=0;i<array.length;i++) {
    if (array[i] == value) {
      return i;
    }
  }
  return -1;
}
function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.addMenu("Admin Tools",[
    {name: "Delete users",functionName: "deleteUsers"}
  ]);
}
function deleteUsers() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var app = UiApp.createApplication().setTitle("Delete users");
  
  var panel = app.createVerticalPanel();
  var label = app.createLabel("Select the users you want to remove (hold Ctrl to select multiple):");
  panel.add(label);
  
  var listbox = app.createListBox(true).setId("userSelect").setName("userSelect");
  
  listbox.setVisibleItemCount(3);
  
  var sheet = ss.getSheets()[1],
      len = sheet.getMaxRows()-1,
      emails = sheet.getRange(2,5,len,1).getValues(), // first row is header
      names = sheet.getRange(2,3,len,1).getValues();
  for (var i=0;i<len;i++) {
    if (emails[i][0])
      listbox.addItem(emails[i][0], names[i][0] + " (" + emails[i][0] + ")");
  }
  panel.add(listbox);
  
  var handler = app.createServerHandler("deleteUsers_click").addCallbackElement(panel);
  var button = app.createButton("Submit",handler);
  panel.add(button);
  
  app.add(panel);
  ss.show(app);
}
function deleteUsers_click(e) {
  var app = UiApp.getActiveApplication();
  var values = e.parameter.userSelect.split(",");
  Logger.log(values.join(","));
  
  var ss = SpreadsheetApp.getActiveSpreadsheet(),
      sheet = ss.getSheets()[1],
      len = sheet.getMaxRows();
  
  for (var i=1;i<=len;i++) {
    var email = sheet.getRange(i,5,1,1).getValue(),
        index = arrayIndexOf(values,email);
    Logger.log(email+" "+index+" "+i);
    if (index >= 0) {
      var doc = DocsList.getFileById(sheet.getRange(i,10,1,1).getValue());
      doc.setTrashed(true);
      
      sheet.deleteRow(i);
      ss.removeViewer(email);
      i--;
      len--;
    }
  }
      
  app.close();
  return app;
}
function getId() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Browser.msgBox("Spreadsheet ID",ss.getId(),Browser.Buttons.OK);
}
function onFormSubmit(e) {
  var date = Math.round(new Date(e.values[0])/1000),
      user = e.values[1],
      message = e.values[2];
  
  var ss = SpreadsheetApp.getActiveSpreadsheet(),
      sheet = ss.getSheets()[0];
  
  sheet.appendRow([date,user,"chat",message]);
}
