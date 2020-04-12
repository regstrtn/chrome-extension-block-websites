"use strict";

// This function is called as soon as https://apis.google.com/js/client.js
// finishes loading.

//Does the current URL match the URL provided by the user
var isDomainsSame = function(userProvidedHostname, urlHostname) {
  var n = urlHostname.search(userProvidedHostname); 
  if(n>=0) return true; 
  return false; 
};

function onLoad() {
  var usageStats = JSON.parse(localStorage.getItem("gwatchme_data"));
  var usageSettings = JSON.parse(localStorage.getItem("gwatchme_settings"));
  if (usageStats) {
    var result="<tr><th>Website</th><th>Time Limit</th><th>"+
    "Time Spent </th></tr>";
    for (var i in usageStats){
        result+='<tr  align="center">';
        var timeLimit = "N/A";
        if (usageSettings){
            for (var j in usageSettings){
                if (isDomainsSame(usageSettings[j].website_name,i)) {
                  timeLimit = usageSettings[j].website_duration;
                }
            }
        }
        if(timeLimit != "N/A") {
          timeLimit = timeLimit + " minutes";
        }
        result+="<td>"+i+"</td>"+"<td>"+timeLimit+"</td>"+"<td>"+Math.round(usageStats[i]/60)+" minutes </td></tr>";
    }
    $('site-list').innerHTML = result;
  }

  $("openOptions").addEventListener("click", openOptionsPage);
}

function openOptionsPage()
{
  chrome.runtime.openOptionsPage();
}

function displaySiteList(siteList){
  for (const i in siteList){
    console.log(i);
  }
}

var bkg = chrome.extension.getBackgroundPage();

const $ = id => document.getElementById(id);

onLoad()

window.onload = function() {

      var usageStats = JSON.parse(localStorage.getItem("gwatchme_data"));
      var ctx = $('donut-canvas').getContext("2d");
      var durations = []
      var domainNames = []
      for(var key in usageStats) {
        durations.push(usageStats[key]);
        domainNames.push(key); 
      }
      var data = {
          datasets: [{
              data: durations,
              backgroundColor: ["#EF5350", "#EC407A", "#AB47BC", "#7E57C2", "#5C6BC0", "#42A5F5", "#29B6F6", "#26C6DA", "#26A69A", "#66BB6A", "#9CCC65", "#D4E157", "#FFEE58", "#FFCA28", "#FFA726", "#FF7043", "#EF9A9A", "F48FB1", "#90CAF9", "#81D4FA", "#80DEEA", "#80CBC4", "#A5D6A7", "#C5E1A5", "#E6EE9C", "#FFF59D"]

          }],

          // These labels appear in the legend and in the tooltips when hovering different arcs
          labels: domainNames
      };

    var myDoughnutChart = new Chart(ctx, {
          type: 'doughnut',
          data: data,
          options: {
            legend: {
              display: false
            }
          }
      });


};
