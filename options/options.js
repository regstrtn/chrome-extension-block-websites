// Options Page: chrome-extension://omnlmmapcpkadfkajeijakgjcjoildaf/options/options.html
// This code has been taken from https://github.com/srikarg/Trackr

var bkg = chrome.extension.getBackgroundPage(); 

var clean_url = function(url) {
    var n = url.search('http');
    var hostname = url; 
    if(n >= 0) {
        hostname = new URL(url).hostname; 
    }
    else {
        var n = url.search('/');
        if(n>=0) {
            hostname = url.substring(0, n); 
        }
        else hostname = hostname;
    }
    bkg.console.log("Clean url: " + hostname);
    return hostname; 
};

var save_options = function() {
    var website_name = $('#restricted-website-name').val();
    website_name = clean_url(website_name);

    var website_duration = parseInt($('#restricted-website-duration').val());
    
    console.log(website_name + website_duration);
    var newDict = {};
    var userSettings = [];
    newDict["website_name"] = website_name;
    newDict["website_duration"] = website_duration;

    if(localStorage.getItem("gwatchme_settings") === null) {
        userSettings = [];
    }
    else {
        userSettings = JSON.parse(localStorage.getItem("gwatchme_settings"));
    }
    // Check if this website exists. If yes, update duration, else add new entry
    var exists = 0, index = -1;
    for(var i in userSettings) {
        console.log(userSettings[i]);
        if(userSettings[i].website_name == website_name) {
                exists = 1;
                break;
            }
    }

    if(exists) {
        userSettings[i].website_duration = website_duration;
    }
    else {
        userSettings.push(newDict);
    }
    localStorage.setItem("gwatchme_settings", JSON.stringify(userSettings));

    restore_options();

};

restore_options = function() {
    $('#pre-configured-websites').empty();
    var userSettings = JSON.parse(localStorage.getItem("gwatchme_settings"));
    $('#pre-configured-websites').append('<table class = "table table-bordered">');
    for (var k in userSettings) {        
        var website_name = userSettings[k].website_name;
        var website_duration = userSettings[k].website_duration;
        $('#pre-configured-websites').append('<tr class = "table-primary">');
        $('#pre-configured-websites').append("<td style='padding:4px;'>"+website_name+ "</td><td style='padding:4px;'>" + website_duration+" minutes</td>");                 
        $('#pre-configured-websites').append('</tr>');
        
    }
    $('#pre-configured-websites').append('</table>');

};

$(function() {
    restore_options();
    $('#save-website').on('click', function() {
        save_options();
        if ($('.alert').length === 0) {
            $('<div class="alert"><p>Website added!</p></div>').prependTo('.container').delay(2000).fadeOut(400, function() {
                $(this).remove();
            });
        }
    });
});
