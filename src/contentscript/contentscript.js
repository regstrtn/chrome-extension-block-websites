// http://www.kirupa.com/html5/detecting_if_the_user_is_idle_or_inactive.htm

//$(function() {

window.onload = function() {
    console.log(window.location.host);
    var hostname = window.location.host;
    console.log(hostname + " loading status: " + document.readyState);

    chrome.runtime.sendMessage({pageLoaded: true}, function(response) {
      console.log("Response from extension: " + JSON.stringify(response));
      if(response.timeLimitExceeded == true) {
          document.getElementsByTagName("body")[0].innerHTML = "<div style = 'font-family: \"Roboto Slab\"; padding: 50px;position:absolute; top:0; left:0;color:white; width:100%; height:100%;background-color:#03bafc;'>\
          <center> <h1> You have exceeded the time limit for today. <br> Go Work! \
          </h1></center>\
          </div>";
      }
    });

}


// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log(request.message);
//     $("body").html("<div style = 'font-family: \"Roboto Slab\"; padding: 50px;position:absolute; top:0; left:0;color:white; width:100%; height:100%;background-color:#03bafc;'>\
//     <center> <h1> You have exceeded the time limit for today. <br> Go Work! \
//      </h1></center>\
//      </div>");
//   }
// );

