$(document).ready(function() {
    // Messages
    $('.status-message .status-close').click(function() {
        $(this).parent().fadeOut();
        return false;
    });
}); // end document.ready