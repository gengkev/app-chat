if (window.chrome.extension) { // yeah we're in the extension

// Code from Google. At least I understand it...
// So, this code takes the hash of the location, and then
//   splits it into parts using regex.exec() into the
//   params object.
var params = {}, queryString = location.hash.replace(/^#/,"");
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
		var response = JSON.parse(xhr.responseText);
		
		if (response.audience != "578737917000.apps.googleusercontent.com") {
			// I still don't know why I have to do this
			$("#status")[0].textContent="Token validation failed (wrong clientid): "+response.audience;
		}
		else {
			// hurrah
			localStorage.setItem("access_code",access_token);
			localStorage.setItem("expires",Date.now()+response.expires_in);
			//location.replace(chrome.extension.getURL("index.html"));
		}
	}
	xhr.onerror=function(e){
		$("#status")[0].textContent="Token validation failed: xhr request error ("+e.toString()+")";
	}
	xhr.send();
}
}
