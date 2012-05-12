function $(q){return document.querySelectorAll(q)};
var logged_in = false, access_code = null, expires = null, email = null;
var users = [
	{
		name: "You",
		full_name: "",
		status_state: 0,
		status_message: "Set status here",
		email: "",
		el: $("#self")[0],
		self: true
	}
];

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
	access_code = getLocalStorage("access_token");
	expires = parseInt(getLocalStorage("expires"));
	email = getLocalStorage("email");
	logged_in = access_code && 
	            email && 
	            expires && 
	            expires === expires && 
	            expires > Date.now()/1000 && 
	            true;
	
	$("span#access_token")[0].textContent = (logged_in) ? access_code : "";
	$("span#logged_in")[0].textContent = (logged_in) ? "yes" : "no";
	$("span#expires")[0].textContent = (logged_in) ? new Date(expires*1000) : "expired";
	$("span#email")[0].textContent = (logged_in) ? email : "";
	$("button#user")[0].textContent = (logged_in) ? email : "Log in";
	
	if (!logged_in && location.hash != "#login") {
		location.replace("#login");
	}
	if (logged_in) {
		$("#close_login")[0].removeAttribute("disabled");
		$("#do_login")[0].setAttribute("disabled");
		
		users[0].email = email;
		
		getUsers();
	}
}
document.addEventListener("DOMContentLoaded",function(e){
	setLoginState();
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
},false);

function getUsers() {
	var userlist = $("#userlist")[0];
	var feed = "https://spreadsheets.google.com/feeds/list/tS9UIr5fIO6cnk_cSiu-RcA/od6/private/full?alt=json";
	quickXhr(feed,"GET",{
		"GData-Version": "3.0",
		"Authorization": "Bearer "+access_code
	},"",function(e) {
		var json = JSON.parse(e.target.responseText);
		var entries = json.feed.entry;
		entries.forEach(function(el,i) {
			var li = document.createElement("li");
			var abbr = document.createElement("abbr");
			abbr.classList.add("user");
			abbr.setAttribute("title",el.gsx$fullname.$t);
			abbr.textContent = el.gsx$usagename.$t;
			li.appendChild(abbr);
			
			var span = document.createElement("span");
			span.classList.add("status");
			span.textContent = el.gsx$statusmessage.$t;
			li.appendChild(span);
			
			var dl = document.createElement("dl");
			{
				var dt = document.createElement("dt");
				dt.textContent = "Email";
				dl.appendChild(dt);
				
				var dd = document.createElement("dd");
				dd.textContent = el.gsx$emailaddress.$t;
				dl.appendChild(dd);
			}
			li.appendChild(dl);
			
			userlist.appendChild(li);
		});
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

