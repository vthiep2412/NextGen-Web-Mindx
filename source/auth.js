document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Clear user session
            localStorage.removeItem('user_session');
            // Redirect to login page
            window.location.href = '/index.html';
        });
    }
});