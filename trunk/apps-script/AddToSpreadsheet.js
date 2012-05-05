/*function doGet(e) {
  var app = UiApp.createApplication(),
    body = app.createDeckPanel(),
    form = app.createFormPanel();
  form.add(app.createInlineLabel("The name you go by: "));
  form.add(app.createTextBox());
  
}*/
function arrayIndexOf(array,value) {
  for (var i=0;i<array.length;i++) {
    if (array[i] == value) {
      return i;
    }
  }
  return -1;
}
function arrayMap(array,func) {
  for (var i=0,output=[];i<array.length;i++) {
    output.push(func(array[i]));
  }
  return output;
}
/* updating addToSpreadsheet
 * the new version should:
 * - create a new spreadsheet
 * - share it with the user
 * - add it to the main spreadsheet list
 * - how can we set it to update onedit?!?!!
 */
// Note: This code is designed with the assumption that the
//       table already has at least 2 rows. It will break
//       if it doesn't!

function addToSpreadsheet(e,r) {
  
  var ss=SpreadsheetApp.getActiveSpreadsheet(),
      sheet=ss.getSheets()[0],
      c=sheet.getLastColumn();
  
  r = r || sheet.getLastRow(); // call manually or just get most recent submit
  
  //hmm, only get the last row since this is run on form submit
  //return an array of all the items in the row
  var range=sheet.getRange(r,1,1,c).getValues()[0];
  // we could also do e.source but watevs for blah()
  
  //ok then
  var user = range[1],
      team = range[5].charAt(0),
      fullNickname = (range[3] || range[6]) + " " + range[4].charAt(0) + ".",
      fullName = range[6] + " " + (range[7].length ? range[7] + " " : "") + range[4];
  
  var ss2 = SpreadsheetApp.openById("0Ai-ZuFD3X1z4dFM5VUlyNWZJTzZjbmtfY1NpdS1SY0E"),
      sheet2 = ss2.getSheets()[1],
      r2=sheet2.getMaxRows(),
      c2=sheet2.getMaxColumns();
  
  // CHECK FOR ALREADY EXISTING (should never be more than one)
  var emails = sheet2.getRange(1,5,r2,1).getValues(),
      duplicate = false;
  for (var i=0;i<emails.length;i++) {
    if (user == emails[i][0]) {
      //r2 = i, duplicate = true; //hehe
      //break; // ...right?
      Logger.log("Duplicate user: "+user);
      return 0; //duplicate users can't use this form :P
    }
  }
  
  // let's make a new spreadsheet for this user!
  
  var myfolder = DocsList.getFolderById("0By-ZuFD3X1z4UkpjWFRhekhoYW8");
  //myfolder.addViewer(user);
  ss2.addViewer(user);
  
  
  var newss = SpreadsheetApp.create(user);
  newss.addEditor(user); // their email address
  
  var newsheet0 = newss.getSheets()[0],
      permissions = newsheet0.getSheetProtection();
  permissions.setProtected(true);
  newsheet0.setSheetProtection(permissions);
  newsheet0.setColumnWidth(1,720);
  newsheet0.getRange("A1")
    .setValue("Don't mess around with this spreadsheet or you'll break stuff! Really. It should be removed from your home folder by the app, in any case.");
  
  newsheet0.deleteRows(2,newsheet0.getMaxRows()-1);
  newsheet0.deleteColumns(2,newsheet0.getMaxColumns()-1);
  
  
  var newsheet1 = newss.insertSheet(1);
  
  newsheet1.deleteRows(2,newsheet1.getMaxRows()-1);
  newsheet1.deleteColumns(2,newsheet1.getMaxColumns()-1);
  newsheet1.insertColumnAfter(1);
  
  
  
  var newss_file = DocsList.getFileById(newss.getId());
  newss_file.addToFolder(myfolder);
  
  ScriptApp.newTrigger("ssOnEdit").forSpreadsheet(newss).onEdit().create();
  
  var date = Math.round(new Date(range[0])/1000);
  
  sheet2.insertRowAfter(r2);
  
  sheet2.getRange(r2+1,1,1,c2).setValues([[
    date, // first joined
    date, // time last online
    fullName,
    fullNickname,
    user, // their email
    "EB", // badges :D
    team,
    0, // -1: banned, 0: offline, 1: idle/away, 2: online, 3: busy/dnd
    "Set status here", // initial status
    newss.getId()// spreadsheet ID
  ]]);
  
}
/* in the user specific spreadsheet, parameters:
 * 0: message
 * 1, 2, 3, 4 are saved for later expansion :D
 */
function ssOnEdit(e) {
  /*
  Logger.log(e);
  var sheet = e.range.getSheet(),
      ss = sheet.getParent();
  
  Logger.log(e.range.getValues());
  Logger.log(ss.getId());
  
  var otherss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log(SpreadsheetApp.getActiveRange().getValues());
  Logger.log(otherss.getId());
  
  var range = sheet.getRange(1,1,1,5),
      vals  = range.getValues()[0];
  
  
  //range.clear();
  
  // update chat thingy
  var ss2 = SpreadsheetApp.openById("0Ai-ZuFD3X1z4dFM5VUlyNWZJTzZjbmtfY1NpdS1SY0E"),
      sheet2 = ss2.getSheets()[0],
      r2 = sheet2.getMaxRows();
  
  sheet2.insertRowAfter(r2);
  sheet2.getRange(r2+1,1,1,4).setValues([[
    Math.round(new Date()/1000),
    ss.getName(),
    "chat",
    vals[1]
  ]]);
  
  Logger.log(vals[1]);
*/
// temporary workaround
  
  Logger.log(e);
  
  // update chat thingy
  var ss2 = SpreadsheetApp.openById("0Ai-ZuFD3X1z4dFM5VUlyNWZJTzZjbmtfY1NpdS1SY0E"),
      ss2_0 = ss2.getSheets()[0],
      ss2_1 = ss2.getSheets()[1],
      r2 = ss2_0.getMaxRows();
  
  var user = String(e.user);
  Logger.log("hai");
  Logger.log(user);
  
  var emails = ss2_1.getRange(1,5,ss2_1.getMaxRows(),1).getValues(),
      found = false;
  for (var i=0;i<emails.length;i++) {
    if (user == emails[i][0]) {
      // okai
      found = true;
      break;
    }
  }
  if (!found) { 
    Logger.log("exiting because email "+user+" not found in spreadsheet");
    Logger.log("emails: \""+emails.toString()+"\" user: \""+user+"\"");
    return 0;
  }
  
  var ss3 = SpreadsheetApp.openById(ss2_1.getRange(i+1,10,1,1).getValue()),
      sheet3 = ss3.getSheets()[1],
      range3 = sheet3.getRange(1,1,1,2);
  
  if (range3.getValue() != e.value) {
    Logger.log("exited because "+range3.getValue()+" != "+e.value);
    return 0;
  }
  range3.clear();
  
  //ss2_0.insertRowAfter(r2);
  //ss2_0.getRange(r2+1,1,1,4).setValues([[
  
  ss2_0.appendRow([
    Math.round(new Date()/1000),
    e.user,
    "chat", 
    e.value
  ]);
  
  //]]);
  
  
}
function blah() {
  addToSpreadsheet(null,3);
}
function blah2() {
  //var ss = SpreadsheetApp.openById("0Ai-ZuFD3X1z4dGswdFczVEpmNDFITzJUR3lxQ0VkRFE");
  ssOnEdit({value:"lol",user:"1390276@fcpsschools.net"});
}
function blah3() {
  var triggers = ScriptApp.getScriptTriggers();
  for (var i=0;i<triggers.length;i++) {
    var del = Browser.msgBox("Hi",
                     "Event type: "+triggers[i].getEventType() + " "
                   + "source id: " + triggers[i].getTriggerSourceId() + " "
                   + "handler function: "+triggers[i].getHandlerFunction() + " "
                   + "unique id: "+triggers[i].getUniqueId(),
                  Browser.Buttons.YES_NO);
    if (del=="yes") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}
function cleanTriggers() {
  var triggers = ScriptApp.getScriptTriggers(),
      ss = SpreadsheetApp.openById("0Ai-ZuFD3X1z4dFM5VUlyNWZJTzZjbmtfY1NpdS1SY0E"),
      sheet = ss.getSheets()[1],
      len = sheet.getMaxRows(),
      values = arrayMap(
        sheet.getRange(1,10,len,1).getValues(),
        function(n) {
          //try {
          //  return SpreadsheetApp.openById(n[0]).getId();
          //} catch(e) {
          //  return "";
          //}
          return n[0];
        }
      );
  
  Logger.log(values);
  
  for (var i=0;i<triggers.length;i++) {
    var trigger = triggers[i], triggerId = "";
    try {
      triggerId = SpreadsheetApp.openById(trigger.getTriggerSourceId()).getId();
    } catch(e) {
      ScriptApp.deleteTrigger(trigger);
      continue;
    }
    //triggerId = trigger.getTriggerSourceId();
    
    Logger.log("Event type: "+trigger.getEventType() + " "
             + "source id: " + triggerId + " "
             + "handler function: "+trigger.getHandlerFunction() + " "
             + "unique id: "+trigger.getUniqueId() + " "
             + "index: "+arrayIndexOf(values,triggerId));
    
    
    if (trigger.getEventType().toString() == "ON_EDIT" &&
        trigger.getHandlerFunction() == "ssOnEdit" &&
        arrayIndexOf(values,triggerId) == -1) {
      ScriptApp.deleteTrigger(trigger);
    }
  }
}
function addAll() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var lastRow = sheet.getLastRow();
  
  for (var i=2;i<=lastRow;i++) {
    addToSpreadsheet(null,i);
  }
}
