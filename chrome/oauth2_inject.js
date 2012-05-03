// Code from Google. At least I understand it...
// So, this code takes the hash of the location, and then
//   splits it into parts using regex.exec() into the
//   params object.
var params = {}, queryString = location.hash.substring(1),
    regex = /([^&=]+)=([^&]*)/g, m;
while (m = regex.exec(queryString)) {
	params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
}
// end

// This is pretty much the biggest library I use
function $(id){return document.getElementById(id)};

// Set up the access token and client id
var access_token = "",
	client_id = "578737917000.apps.googleusercontent.com";

if (params.error) {
	// Goodness me, there's an error
	$("status").innerHTML="Invalid query parameters: "+params.error;
	if(params.error=="access_denied") {
		$("status").innerHTML += "\n\nWhich means you didn't allow access. Hooray.";
	}
} else {
	access_token = params.access_token;
	
	var xhr = new XMLHttpRequest();
	xhr.open("GET","https://www.googleapis.com/oauth2/v1/tokeninfo?access_token="+access_token,true);
	xhr.onload=function(){
		var response = JSON.parse(xhr.responseText);
		
		if (response.audience != "578737917000.apps.googleusercontent.com") {
			// I still don't know why I have to do this
			$("status").innerHTML="Token validation failed (wrong clientid): "+response.audience;
		}
		else {
			// hurrah
			location.replace("chrome-extension://__MSG_@@extension_id__/index.html");
		}
	}
	xhr.onerror=function(e){
		$("status").innerHTML="Token validation failed: request error ("+e.toString()+")";
	}
	xhr.send();
}

