if (window.chrome.extension) { // yeah we're in the extension

// Code from Google. At least I understand it...
// So, this code takes the hash of the location, and then
//   splits it into parts using regex.exec() into the
//   params object.
var params = {}, queryString = location.hash.replace(/^#/,""),
    regex = /([^&=]+)=([^&]*)/g, m;
while (m = regex.exec(queryString)) {
	params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
}
// end

// This is pretty much the biggest library I use
function $(q){return document.querySelectorAll(q)};

// Set up the access token and client id
var access_token = "",
	client_id = "578737917000.apps.googleusercontent.com";

if (params.error) {
	// Goodness me, there's an error
	$("#status")[0].innerHTML="Invalid query parameters: "+params.error;
	if(params.error=="access_denied") {
		$("#status")[0].innerHTML += "\n\nWhich means you didn't allow access. Hooray.";
	}
} else {
	access_token = params.access_token;
	
	var xhr = new XMLHttpRequest();
	xhr.open("GET","https://www.googleapis.com/oauth2/v1/tokeninfo?access_token="+access_token,true);
	xhr.onload=function(){
		var response = JSON.parse(xhr.responseText), curDate = Date.now();
		
		if (response.audience != "578737917000.apps.googleusercontent.com") {
			// I still don't know why I have to do this
			xhr.onerror("Token validation failed (wrong clientid): "
				+ response.audience + " versus " + client_id + ", error " + response.error);
		}
		else {
			// hurrah
			var xhr2 = new XMLHttpRequest();
			xhr2.open("GET","https://www.googleapis.com/oauth2/v1/userinfo?access_token="+access_token, true);
			xhr2.onload = function() {
				var response2 = JSON.parse(xhr2.responseText);
				if (response.user_id == response2.id && response2.email) {
					done(access_token,Math.round(curDate/1000+response.expires_in),response2.email);
				} else {
					xhr.onerror("something weird happened");
				}
			}
			xhr2.onerror = xhr.onerror;
			xhr2.send();
		}
	}
	xhr.onerror=function(e){
		$("#status")[0].textContent="Token validation failed: xhr request error ("+e.toString()+")";
	}
	xhr.send();
}
function done(access_token,expires,email) {
	localStorage.setItem("access_token",access_token);
	localStorage.setItem("expires",expires);
	localStorage.setItem("email",email);
	//location.replace(chrome.extension.getURL("index.html"));
	location.replace(chrome.extension.getURL("index.html") + "#login");
}
} // end if(window.chrome.extension)
