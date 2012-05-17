
if (location.search.indexOf("formkey=dFM5VUlyNWZJTzZjbmtfY1NpdS1SY0E6MQ") != -1) {
	var blah = location.pathname.split("/");
	switch (blah[blah.length-1].toLowerCase()) {
	case "formresponse":
		location.replace("embeddedform?formkey=dFM5VUlyNWZJTzZjbmtfY1NpdS1SY0E6MQ");
		break;
	case "embeddedform":
		//document.documentElement.style.display = "none";
		
		document.addEventListener("DOMContentLoaded",function(){
			document.querySelector(".ss-form-heading").style.display = "none";
			document.querySelector(".ss-footer").style.display = "none";
			document.getElementById("emailReceipt").checked = false;
		
			document.body.style.padding = "0";
			document.body.style.width = "100%";
		
			var textarea = document.getElementById("entry_0");
			textarea.style.position = "absolute";
			textarea.style.left = "0";
			textarea.style.top = "0";
			textarea.style.height="100%";
			textarea.style.maxWidth= "100%";
			textarea.style.width="100%";
			textarea.style.zIndex="9999";
			textarea.style.padding = "5px";
			textarea.style.resize = "none";
			textarea.style.border = "none";
			textarea.style.display="block";
		
			textarea.onkeypress = function(e) {
				e = e || window.event;
				var code = e.keyCode || e.which;
				if (code == 13) { // && !e.shiftKey) {
					document.forms["ss-form"].submit.click();
				}
			}
			textarea.focus();
		},false);
		break;
	default:
		console.log(blah[blah.length-1]);
	}
}
