var interval = null;
var updateTime = 5000;
var currentTabInfo = {};
var userActive = true;
var settings = {};
var bkg = chrome.extension.getBackgroundPage();
var urls = {};
var timeSpent = {};
var timeStart = {}; 
var TIME_CUTOFF = 180;

var getCurrentTab = function(data){

};


//Does the current URL match the URL provided by the user
var isDomainsSame = function(userProvidedHostname, urlHostname) {
	var n = urlHostname.search(userProvidedHostname); 
	if(n>=0) return true; 
	return false; 
};

var prepopulateTimeSpent = function() {
	bkg.console.log("prepopulateTimeSpent");
	if(localStorage.getItem("gwatchme_data") != null) {
		timeSpent = JSON.parse(localStorage.getItem("gwatchme_data"));
	}
}

//If this domain has been set by the user, return the time limit, 
//else return INT_MAX
var getDomainTimeLimit = function(hostname) {
	var userSettings = JSON.parse(localStorage.getItem("gwatchme_settings"));
	var index = 0, durationLimit = 1000000; 
	for(var i in userSettings) {
		if(isDomainsSame(userSettings[i].website_name, hostname)) {
			durationLimit  = parseInt(userSettings[i].website_duration); 
			bkg.console.log(hostname + " limit was set to " + durationLimit);
			return durationLimit;
		}
	}
	bkg.console.log("No entry found in userSettings for " + hostname + " " + JSON.stringify(userSettings));
	//If hostname not found return max number
	return Number.MAX_SAFE_INTEGER;
};

//Deprecated
// var returnMessageToTab = function(messageToReturn, changeInfo) {
//   var joinedMessage = messageToReturn;
//   bkg.console.log("Background script is sending a message to contentscript:'" + joinedMessage +"'");
//   chrome.tabs.query({active:true, currentWindow: true}, function(tabs) {
//   	  bkg.console.log(changeInfo); 
// 	  if(changeInfo.status != 'complete') {
// 	  	setTimeout(
// 	  		function() {
// 				chrome.tabs.sendMessage(tabs[0].id, {message: joinedMessage});  
// 			 	bkg.console.log("Message being sent to: " + urls[tabs[0].id] + " " + tabs[0].id + " " + changeInfo.status);
// 	  		}, 3000
// 	  	);
// 	  }
// 	  else {
// 	  	bkg.console.log("Tab load status " + changeInfo.status);
// 	  }
//   });
// };

//Check if a time limit has been set for the current URL 
var checkForTimeLimit = function(hostname, changeInfo) {
	//This is our first visit to this website
	var timeSpentOnWebsite = 0; 

	if(!(hostname in timeSpent)) {
		//Retrieve time spent data from local storage
		bkg.console.log(hostname + " was not found in dict. Searching storage. " + JSON.stringify(timeSpent));
		var timeSpentData = JSON.parse(localStorage.getItem("gwatchme_data"));
		if(timeSpentData == null) {
			bkg.console.log("timeSpentData from storage was null " + JSON.stringify(timeSpentData));
			return;
		}
		if(!(hostname in timeSpentData)) {
			bkg.console.log(hostname + " was not found in storage timeSpentData " + JSON.stringify(timeSpentData));
			return; 			
		}			
		else {
			bkg.console.log(hostname + " found in timeSpentData " + JSON.stringify(timeSpentData));
			timeSpentOnWebsite = timeSpentData[hostname];
		}
	}
	else {
		timeSpentOnWebsite = timeSpent[hostname]; 
	}

	var domainTimeLimit = getDomainTimeLimit(hostname); 
	bkg.console.log(timeSpentOnWebsite, domainTimeLimit); 
	if(timeSpentOnWebsite > domainTimeLimit) {
		bkg.console.log("Time limit exceeded for domain " + hostname); 
		//alert("Time Limit Exceeded!"); 
		return true; 
		//returnMessageToTab("Time Limit Exceeded", changeInfo);
	}

};



//Before closing a tab, log the amount of time spent on the tab
var logTimeSpent = function(tabId, removeInfo) {
//	if(!(hostname in timeStart)) return; 
	
	prepopulateTimeSpent(); 

	var hostname = urls[tabId];
	if(typeof(hostname) === 'undefined' || hostname === 'newtab') 
		return;
	bkg.console.log(hostname + "closed");
	var currentTime = Math.floor(Date.now()/1000); //in seconds
	
	var duration = Math.min(TIME_CUTOFF, currentTime - timeStart[hostname]);

	//If this is the first time this URL is being opened
	//Create a new entry in timeSpent dictionary, else add time
	if(hostname in timeSpent) {
		timeSpent[hostname] = timeSpent[hostname] + duration; 
	}
	else {
		timeSpent[hostname] = duration; 
	}

	localStorage.setItem("gwatchme_data", JSON.stringify(timeSpent));
}

var startLoggingNewTab = function( tabId,  changeInfo,  tab) {
		//alert("URL Captured" + tab.url);
		if(!changeInfo.url || tab.url === 'newtab') 
			return;
		var hostname = new URL(tab.url).hostname;
		bkg.console.log("Logging New Tab " + hostname);

		//If a new website is being opened in the same tab
		//If there was a different website on this tab, urls dictionary will have this information
		if(tabId in urls) { // && hostname != urls[tabId]) {
			bkg.console.log("URL List: " + JSON.stringify(urls));
			logTimeSpent(tabId, null); 
		}
		if (hostname != 'newtab' && hostname != 'undefined') {
    		urls[tabId] = hostname;
  			timeStart[hostname] = Math.floor(Date.now()/1000); 
  		}
  		bkg.console.log("URL List after adding new website: " + JSON.stringify(urls));

		//Time limit can only be checked once the page has fully loaded  		
  		//checkForTimeLimit(hostname, changeInfo); 
  		
};

var restartTimerOnIdleTab = function(activeInfo) {

	var tabId = activeInfo.tabId;
	var hostname = "";

	//If a new website is being opened in the same tab
	//If there was a different website on this tab, urls dictionary will have this information
	if(tabId in urls) { // && hostname != urls[tabId]) {
		bkg.console.log("URL List: " + JSON.stringify(urls));
		hostname = urls[tabId];	
		bkg.console.log("Idle tab reactivated " + hostname);
		logTimeSpent(tabId, null); 

	}

	if (hostname != 'newtab' && hostname != 'undefined' && hostname!="") {
		urls[tabId] = hostname;
			timeStart[hostname] = Math.floor(Date.now()/1000); 
		}
};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    bkg.console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

    if(!sender.tab) {
    	bkg.console.log("Returning because no url " + sender.tab.url);
    	return;
    }
    prepopulateTimeSpent(); 
    var hostname = new URL(sender.tab.url).hostname; 
    var timeLimitExceeded = checkForTimeLimit(hostname, null);
    if(timeLimitExceeded) {
    	 bkg.console.log("Sending response to the page to shut down " + hostname);
		 sendResponse({message: "Time Limit Exceeded", timeLimitExceeded:true});    	
    }
  });


//chrome.tabs.onCreated.addListener(startLoggingNewTab);
chrome.tabs.onUpdated.addListener(startLoggingNewTab);
chrome.tabs.onActivated.addListener(restartTimerOnIdleTab);
chrome.tabs.onRemoved.addListener(logTimeSpent);