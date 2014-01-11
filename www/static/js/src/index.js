/*! File:   index.js
 *  Author: Elijah Kaytor
 */

/// Depencencies
var $ = $ || console.error('Missing Dependencies: jQuery');
// Deffered resources
var Firebase = Firebase;
var sha256 = sha256;


/// Handle Form submissions
// Regexp for email
var validEmail = /^[\w\.%+-]+@[\w\.-]+\.[A-z]{2,6}$/;

// Wait for user input
$('#submit').click(function() {
    
    // Get the email address
    var email = $('#email').val();
    
    // Check if the email is valid
    if (!validEmail.exec(email)) return $('#invalid-input').show() && false;
    else $('#invalid-input').hide();
    
    // Connect to the firebase (deffered to avoid needless connections)
    var db = new Firebase($('meta[name=firebase]').attr('content'));
    
    // Add the users email
    db.child('notify-list').child(sha256(email).slice(32)).set({
        email: email,
        time: new Date().getTime(),
    }, function(error) {
        
        // Close the connection
        try      { db.close(); }
        catch(e) { db = null;  }
        
        // Check if there was an error
        if (error)  return $('#database-error').show() && false;
        // Otherwise display the sucess message
        else $('#success').show();
        
    });
    
    return false;
    
});


/// Listen for page actions
// Direct link click
$('a[href=#notify-me]').click(function() {
    history.replaceState(null, null, '#notify-me');
    pages.switchTo(3);
    pages.stop();
    
    return false;
});

// Pause on start of input
$('#email').on('focus', function() {
    history.replaceState(null, null, '#notify-me');
    pages.switchTo(3);
    pages.stop();
});

// Home link clicked
$('#home').click(function() {
    history.replaceState(null, null, '/');
    pages.cycle(2400, 0);
    
    return false;
});


/// Inner-``Pages''
// Variable to store current page
var page = 0;

// Create an Array store pages
//  (this is a dynamic programming approach; assumes static DOM)
var pages = [];

// Create an Array filled with all of the pages
pages.all = $('[class*=page-]');

// Find out how many pages we have
pages.amount = 0;
while($('.page-' + pages.amount).length > 0) pages.amount++;

// Generate selectors for each of the pages
for (var p = 0; p <= pages.amount; p++)
    pages[p] = $('.page-' + p);

// Switch to the given page
pages.switchTo = function(nextPage) {
    page = nextPage;
    pages[page].removeClass('inactive');
    pages.all.not(pages[page]).addClass('inactive');
};

// Cycle Start function
pages.cycle = function(interval, startPage) {
    page = startPage !== undefined ? startPage : page;
    
    // Run an intial cycle
    pages.switchTo(page);
    
    // Clear any ongoing intervals
    if (pages.interval) window.clearInterval(pages.interval);
    
    // Start the cycle
    pages.interval = window.setInterval(function() {
        // Increment current page (or reset to 0)
        if (++page >= pages.amount) page -= pages.amount;
        
        // Assign the inactive class accordingly
        pages.switchTo(page);
    }, interval);
};

// Cycle Stop function
pages.stop = function() {
    window.clearInterval(pages.interval);
    pages.interval = null;
};

// Start the cycle for 2400ms
pages.cycle(2400);


/// Check for permalink
if (location.hash == '#notify-me') {
    pages.switchTo(3);
    pages.stop();
}