if (location.search.indexOf("formkey=dFM5VUlyNWZJTzZjbmtfY1NpdS1SY0E6MQ") != -1) {
	var blah = location.pathname.split("/").pop();
	if (blah.toLowerCase() == "formresponse") {
		location.replace("embeddedform?formkey=dFM5VUlyNWZJTzZjbmtfY1NpdS1SY0E6MQ");
	} else if (blah.toLowerCase() == "embeddedform") {
		//document.documentElement.style.display = "none";
	
		document.addEventListener("DOMContentLoaded",function(){
			document.body.style.display = "block !important";
			document.getElementById("emailReceipt").checked = false;
	
			var textarea = document.getElementById("entry_0");
	
			textarea.onkeypress = function(e) {
				e = e || window.event;
				var code = e.keyCode || e.which;
				if (code == 13) { // && !e.shiftKey) {
					document.forms["ss-form"].submit.click();
				}
			}
			textarea.focus();
		},false);
	}
} else {
	document.addEventListener("DOMContentLoaded",function(){
		document.body.classList.add("wrongForm");
	},false);
}
