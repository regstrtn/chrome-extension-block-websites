"use strict";
var MAX_DOMAINS_SHOWN=20;

// This function is called as soon as https://apis.google.com/js/client.js
// finishes loading.

//Does the current URL match the URL provided by the user
var isDomainsSame = function(userProvidedHostname, urlHostname) {
  var n = urlHostname.search(userProvidedHostname); 
  if(n>=0) return true; 
  return false; 
};

function _compareDurations(duration1, duration2) {
  return -(duration1.duration - duration2.duration); 
}

function getTopKDomains(durations) {
  var domainsToShow = Math.min(MAX_DOMAINS_SHOWN, durations.length); 
  durations = durations.sort(_compareDurations); 
  durations = durations.slice(0,domainsToShow);
  return durations; 
}

function displaySiteList(usageSettings, usageStats) {
  // usageStats=[{"domain":"x.com","duration":1000},{"domain":"y.com","duration":200}]
  // usageSettings=[{"website_name":"x.com","website_duration":4},{...}]
  if (usageStats) {
    var result="<tr><th>Website</th><th>Time Limit</th><th>"+
    "Time Spent </th></tr>";
    for (var i in usageStats){
        var domain = usageStats[i].domain;
        result+='<tr  align="left">';
        var timeLimit = "N/A";
        if (usageSettings){
            for (var j in usageSettings){
                if (isDomainsSame(usageSettings[j].website_name,domain)) {
                  timeLimit = usageSettings[j].website_duration;
                }
            }
        }
        if(timeLimit != "N/A") {
          timeLimit = timeLimit + " minutes";
        }
        var timeSpent = Math.round((usageStats[i].duration)/60);
        result+="<td>"+domain+"</td>"+"<td>"+timeLimit+"</td>"+"<td>"+timeSpent+" minutes </td></tr>";
    }
    $('site-list').innerHTML = result;
  }

  $("openOptions").addEventListener("click", openOptionsPage);
}

function openOptionsPage()
{
  chrome.runtime.openOptionsPage();
}

function logSiteList(siteList){
  for (const i in siteList){
    console.log(i);
  }
}

//Function plots topKdomains
function plotPieChart(durations) {

  var durationsdata = []
  var domainNames = []

  for (var index in durations) {
    durationsdata.push(durations[index].duration); 
    domainNames.push(durations[index].domain);
  }

  //Plot chart
  var ctx = $('donut-canvas').getContext("2d");
  var data = {
      datasets: [{
          data: durationsdata,
          backgroundColor: ["#29B6F6","#26C6DA","#26A69A","#66BB6A","#9CCC65","#D4E157","#FFEE58","#FFCA28","#FFA726","#FF7043","#EF9A9A","F48FB1","#90CAF9","#81D4FA","#80DEEA","#80CBC4","#A5D6A7","#C5E1A5","#E6EE9C","#FFF59D","#EF5350","#EC407A","#AB47BC","#7E57C2","#5C6BC0","#42A5F5"]

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
}

var bkg = chrome.extension.getBackgroundPage();

const $ = id => document.getElementById(id);


window.onload = function() {

  var usageStats = JSON.parse(localStorage.getItem("gwatchme_data"));
  var usageSettings = JSON.parse(localStorage.getItem("gwatchme_settings"));
  var durations = []
  for(var key in usageStats) {
    durations.push({domain: key, duration:usageStats[key]});
    //domainNames.push(key); 
  }
  //Trim the data
  durations = getTopKDomains(durations);

  displaySiteList(usageSettings, durations);
  plotPieChart(durations);

};
