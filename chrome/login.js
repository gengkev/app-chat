function $(q){return document.querySelectorAll(q)};

function getLocalStorage(id) {
	var s = localStorage.getItem(id);
		if (!!s && typeof s.valueOf() == "string" && s.length > 0 && s != "undefined" && s != "null") {
		return s;
	}
	return null;
}
window.onload = function() {
	var access_code = getLocalStorage("access_token"),
	    expires = parseInt(getLocalStorage("expires")),
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
	
	if (logged_in) {
		$("button#start")[0].classList.remove("hidden");
	}
	
	$("button#start")[0].onclick = function() {
		location.replace("index.html");
	}
	
	$("button#login")[0].onclick = function() {
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
}
