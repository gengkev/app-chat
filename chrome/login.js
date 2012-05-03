function $(q){return document.querySelectorAll(q)};

window.onload = function() {
	$("span#access_code")[0].textContent = localStorage.getItem("access_code");
	
	$("button#login")[0].onclick = function() {
		var url = "https://accounts.google.com/o/oauth2/auth?";
		var params = {
			"response_type": "token",
			"client_id": "578737917000.apps.googleusercontent.com",
			"redirect_uri": "https://app-chat.googlecode.com/svn/trunk/chrome_callback.html",
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
