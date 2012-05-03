function $(q){return document.querySelectorAll(q)};

function getLocalStorage(id) {
	var s = localStorage.getItem(id);
		if (!!s && typeof s.valueOf() == "string" && s.length > 0 && s != "undefined" && s != "null") {
		return s;
	}
	return null;
}
window.onload = function() {
	var access_code = getLocalStorage("access_code"),
	    expires = parseInt(getLocalStorage("expires")),
	    logged_in = access_code && expires && expires === expires && expires < Date.now() && true;
	
	$("span#access_code")[0].textContent = (logged_in) ? access_code : "";
	$("span#logged_in")[0].textContent = (logged_in) ? "yes" : "no";
	
	$("button#login")[0].onclick = function() {
		var url = "https://accounts.google.com/o/oauth2/auth?";
		var params = {
			"response_type": "token",
			"client_id": "578737917000.apps.googleusercontent.com",
			"redirect_uri": "https://app-chat.googlecode.com/svn/trunk/chrome/callback.html",
			"scope": [
				"https://docs.google.com/feeds/",
				"https://docs.googleusercontent.com/",
				"https://spreadsheets.google.com/feeds/"
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
