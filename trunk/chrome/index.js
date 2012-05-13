function $(q){return document.querySelectorAll(q)};
var logged_in = false, access_token = null, expires = null, email = null;
var post_worksheet_url = null;
var users = [
	{
		name: "You",
		full_name: "",
		status_state: 0,
		status_message: "Set status here",
		email: "",
		team: "",
		el: null,
		spreadsheetId: ""
	}
];
var user_poll_etag = null;
/* Status states:
 * (negative) - Banned until (date)
 * 0 - offline
 * 1 - online
 * 2 - busy
 * 3 - idle (online)
 * 4 - idle (busy)
 */
var status_states = {
	"": "banned",
	"0": "offline",
	"1": "available",
	"2": "busy",
	"3": "idle",
	"4": "idle"
};
function getStatusState(status) {
	return status_states[status] || status_states[""];
}
var dlList = {
	"Status": "status_state_text",
	"Email": "email",
	//"Full name": "full_name",
	"Team": "team"
}

function getLocalStorage(id) {
	var s = localStorage.getItem(id);
		if (!!s && typeof s.valueOf() == "string" && s.length > 0 && s != "undefined" && s != "null") {
		return s;
	}
	return null;
}
function login() {
	var url = "https://accounts.google.com/o/oauth2/auth?";
	var params = {
		"response_type": "token",
		"client_id": "578737917000.apps.googleusercontent.com",
		"redirect_uri": "https://app-chat.googlecode.com/svn/trunk/chrome/callback.html",
		"scope": [
			"https://spreadsheets.google.com/feeds/",
			"https://www.googleapis.com/auth/userinfo.email"
		].join(" "),
		"approval_prompt": "auto",
		"hd": "fcpsschools.net"
	};

	for (var i in params) {
		if (!params.hasOwnProperty(i)) continue;

		url += i + "=" + params[i] + "&";
	}

	location.replace(url);
}
function setLoginState() {
	access_token = getLocalStorage("access_token");
	expires = parseInt(getLocalStorage("expires"));
	email = getLocalStorage("email");
	logged_in = access_token && 
	            email && 
	            expires && 
	            expires === expires && 
	            expires > Date.now()/1000 && 
	            true;
	
	$("span#access_token")[0].textContent = (logged_in) ? access_token : "";
	$("span#logged_in")[0].textContent = (logged_in) ? "yes" : "no";
	$("span#expires")[0].textContent = (logged_in) ? new Date(expires*1000) : "expired";
	$("span#email")[0].textContent = (logged_in) ? email : "";
	$("button#user")[0].textContent = (logged_in) ? email : "Log in";
	
	if (!logged_in && location.hash != "#login") {
		location.replace("#login");
	}
	if (logged_in) {
		$("#close_login")[0].removeAttribute("disabled");
		$("#do_login")[0].textContent = "Sign out of App Chat";
		$("#do_login")[0].onclick = function() {
			clearState();
			location.reload();
		}
		
		users[0].email = email;
		
		getUsers(function(){
			getWorksheetUrl();
		});
		beginPoll();
	} else {
		clearState();
	}
}
function clearState() {
	localStorage.removeItem("access_token");
	localStorage.removeItem("expires");
	localStorage.removeItem("email");
}
document.addEventListener("DOMContentLoaded",function(e){
	users[0].el = $("#self")[0];
	
	$("button#user")[0].onclick = function() {
		location.replace("#login");
	};
	$("button#do_login")[0].onclick = login;
	
	$("nav h1")[0].onclick = function(){
		location.replace("index.html");
	}
	$("#close_login")[0].onclick = $(".cover")[0].onclick = function() {
		if (logged_in) {
			location.replace("index.html");
		}
	}
	
	setLoginState();

},false);

function getWorksheetUrl() {
	var sheetUrl = "https://spreadsheets.google.com/feeds/worksheets/"
	  + users[0].spreadsheetId + "/private/full?alt=json";
	quickXhr(sheetUrl,"GET",{
		"GData-Version": "3.0",
		"Authorization": "Bearer "+access_token
	},"",function(e) {
		var json = JSON.parse(e.target.responseText);
		post_worksheet_url = json.feed.entry[1].link[0].href;
		postToForm("chat","yay it works");
	});
}
function beginPoll() {
	var USERS_INTERVAL = 15 * 1000;
	var CHAT_INTERVAL =   2 * 1000;
	
	setInterval(getUsers,USERS_INTERVAL);
}

function getUsers(callback) {
	var userlist = $("#userlist")[0];
	var feed = "https://spreadsheets.google.com/feeds/list/tS9UIr5fIO6cnk_cSiu-RcA/od6/private/full?alt=json";
	quickXhr(feed,"GET",{
		"GData-Version": "3.0",
		"Authorization": "Bearer "+access_token,
		"If-None-Match": user_poll_etag
	},"",function(e) {
		if (e.target.status != 200) {
			if (e.target.status != 304) {
				console.log("Error, response status "+e.target.status);
			}
			return;
		}
		
		user_poll_etag = e.target.getResponseHeader("ETag");
		
		var json = JSON.parse(e.target.responseText);
		var entries = json.feed.entry;
		entries.forEach(function(el,i) {
			updateUser({
				name: el.gsx$usagename.$t,
				full_name: el.gsx$fullname.$t,
				status_state: el.gsx$statusstate.$t,
				status_state_text: getStatusState(el.gsx$statusstate.$t),
				status_message: el.gsx$statusmessage.$t,
				email: el.gsx$emailaddress.$t,
				team: el.gsx$rcmsteam.$t,
				spreadsheetId: el.gsx$spreadsheetid.$t
			});
		});
		if(callback) callback.call();
		// now we must sort the user list
	});
}
function copyHashMap(map) {
	var output = {};
	for (var i in map) {
		if (!map.hasOwnProperty(i)) continue;
		output[i] = map[i];
	}
	return output;
}
function updateUser(map) {
	map = copyHashMap(map); // to keep the object "pure"?
	
	for (var i=0,found=false;i<users.length;i++) {
		if (users[i].email == map.email) {
			found = true;
			break;
		}
	}
	if (!found) {
		// yay we have to create it
		
		var li = document.createElement("li");
		
		// lazy I am
		li.innerHTML = '<abbr class=\"user\"></abbr><span class=\"status\"></span><dl></dl>';
		dl = li.getElementsByTagName("dl")[0];
		
		for (var j in dlList) {
			if (!dlList.hasOwnProperty(j)) continue;
			var span = document.createElement("span"),
			    dt = document.createElement("dt"),
			    dd = document.createElement("dd");
			
			dt.textContent = j;
			dd.textContent = map[dlList[j]];
			
			span.appendChild(dt);
			span.appendChild(dd);
			dl.appendChild(span);
		}
		
		map.el = li;
		i = users.length;
		users.push(map);
		
		$("#userlist")[0].appendChild(li);
	} else {
		// update dl
		var dl = users[i].el.getElementsByTagName("dl")[0];
		var spans = dl.getElementsByTagName("span");
		
		for (var j=0;j<spans.length;j++) {
			var dd = spans[j].getElementsByTagName("dd")[0];
			var dt = spans[j].getElementsByTagName("dt")[0];
			
			dd.textContent = map[dlList[dt.textContent]];
		}
	}
	var li = users[i].el;
	
	li.className = getStatusState(map.status_state);
	
	var abbr = li.getElementsByTagName("abbr")[0];
	abbr.setAttribute("title",map.full_name);
	abbr.textContent = map.name;
	
	var span = li.getElementsByTagName("span")[0];
	span.textContent = map.status_message;
	
	map.el = li;
	users[i] = map;
}
function postToForm(message1,message2) {

	/* I give up!!!
	
	var feed = document.createElementNS("http://www.w3.org/2005/Atom","feed");
	feed.setAttribute("xmlns","http://www.w3.org/2005/Atom");
	feed.setAttribute("xmlns:batch","http://schemas.google.com/gdata/batch");
	feed.setAttribute("xmlns:gs","http://schemas.google.com/spreadsheets/2006");
	
	var id = document.createElementNS("http://www.w3.org/2005/Atom","id");
	id.textContent = post_worksheet_url;
	feed.appendChild(id);
	
	var entry1 = document.createElementNS("http://www.w3.org/2005/Atom","entry");
	var entry2 = entry1.cloneNode();
	
	var batch$id = document.createElementNS("http://schemas.google.com/gdata/batch","batch:id");
	batch$id.textContent = "A1";
	entry1.appendChild(batch$id);

	batch$id = batch$id.cloneNode();
	batch$id.textContent = "A2";
	entry2.appendChild(batch$id);

	var batch$operation = document.createElementNS("http://schemas.google.com/gdata/batch","batch:operation");
	batch$operation.setAttribute("type","update");
	entry1.appendChild(batch$operation);
	entry2.appendChild(batch$operation.cloneNode());
	
	var gs$cell = document.createElementNS("http://schemas.google.com/spreadsheets/2006","gs:cell");
	gs$cell.setAttribute("row","1");
	gs$cell.setAttribute("col","1");
	gs$cell.setAttribute("inputvalue",message1);
	entry1.appendChild(gs$cell);
	
	gs$cell = gs$cell.cloneNode();
	gs$cell.setAttribute("col","2");
	gs$cell.setAttribute("inputvalue",message2);
	entry2.appendChild(gs$cell);
	
	
	feed.appendChild(entry1);
	feed.appendChild(entry2);
	*/
	
	var xml = '<feed xmlns=\"http://www.w3.org/2005/Atom\" xmlns:batch=\"http://schemas.google.com/gdata/batch\" '
	  + 'xmlns:gs=\"http://schemas.google.com/spreadsheets/2006\"><id>'+post_worksheet_url+'</id>'
	  
	  + '<entry><batch:id>A1</batch:id><batch:operation type=\"update\"/><id>'+post_worksheet_url+'/R1C1</id>'
	  + '<link rel=\"edit\" type=\"application/atom+xml\" href=\"'+post_worksheet_url+'/R1C1\"/>'
	  + '<gs:cell row=\"1\" col=\"1\" inputValue=\"'+message1+'\"/></entry>'
	  
	  + '<entry><batch:id>A2</batch:id><batch:operation type=\"update\"/><id>'+post_worksheet_url+'/R1C2</id>'
	  + '<link rel=\"edit\" type=\"application/atom+xml\" href=\"'+post_worksheet_url+'/R1C2\"/>'
	  + '<gs:cell row=\"1\" col=\"2\" inputValue=\"'+message2+'\"/></entry>'
	  
	  + '</feed>';
	console.log(xml);
	
	quickXhr(post_worksheet_url + "/batch","POST",{
		"GData-Version": "3.0",
		"Authorization": "Bearer "+access_token,
		"If-None-Match": "blahblahblah"
	},xml,function(e){
		console.log(e.responseText)
	});
}
function quickXhr(url,method,headers,content,onload) {
	var xhr = new XMLHttpRequest();
	xhr.open(method,url);
	for (var i in headers) {
		if (!headers.hasOwnProperty(i)) continue;
		xhr.setRequestHeader(i,headers[i]);
	}
	xhr.onload = onload;
	xhr.send(content);
}

