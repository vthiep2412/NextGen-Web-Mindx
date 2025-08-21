$(function() {
    $("#partner").mousewheel(function(event, delta) {
        this.scrollLeft -= (delta * 30); // Adjust speed
        event.preventDefault(); // Prevent vertical scrolling takeover
    });
});