document.addEventListener('DOMContentLoaded', function () {
    const dropdownElement = document.getElementById('user-actions-dropdown');
    if (!dropdownElement) return;

    const dropdownMenu = dropdownElement.nextElementSibling;
    const dropdownInstance = new bootstrap.Dropdown(dropdownElement);
    let isHiding = false;

    dropdownElement.addEventListener('hide.bs.dropdown', function (event) {
        if (isHiding) {
            isHiding = false; // reset for next time
            return;
        }
        event.preventDefault();
        dropdownMenu.classList.add('hiding');
        
        dropdownMenu.addEventListener('animationend', function handler() {
            dropdownMenu.classList.remove('hiding');
            isHiding = true;
            dropdownInstance.hide();
            dropdownMenu.removeEventListener('animationend', handler);
        });
    });
});