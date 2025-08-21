// document.querySelectorAll('*').forEach(element => {
//     if (element.scrollWidth > element.clientWidth) { // Detects horizontal scrollable elements
//         element.addEventListener('wheel', function(event) {
//             console.log("oioioi");
//             if (event.deltaY !== 0) {
//                 event.preventDefault(); // Prevent vertical scrolling takeover
//                 this.scrollTo({
//                     left: this.scrollLeft + event.deltaY,
//                     behavior: 'smooth'
//                 }); // Smooth horizontal scroll
//             }
//         });
//     }
// });
function smoothScroll(element, target, duration = 400) {
    const start = element.scrollLeft;
    const change = target - start;
    const startTime = performance.now();

    function animateScroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        element.scrollLeft = start + change * progress;
        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    }
    requestAnimationFrame(animateScroll);
}

setTimeout(() => {
    document.querySelectorAll('*').forEach(element => {
        if (element.scrollWidth > element.clientWidth) {
            element.addEventListener('wheel', function(event) {
                event.preventDefault();
                let scrollAmount = event.deltaY * 2;
                smoothScroll(this, this.scrollLeft + scrollAmount, 200); // Slower scroll (600ms)
            });
        }
    });
},1000);

function handleWheelScroll(event) {
    event.preventDefault();
    let scrollAmount = event.deltaY * 2;
    smoothScroll(event.currentTarget, event.currentTarget.scrollLeft + scrollAmount, 200);
}

setTimeout(() => {
    window.addEventListener('resize', function() {
        // console.log('Window resized');
        document.querySelectorAll('*').forEach(element => {
            if (element.scrollWidth > element.clientWidth) {
                element.removeEventListener('wheel', handleWheelScroll);
                element.addEventListener('wheel', handleWheelScroll);
            } else {
                element.removeEventListener('wheel', handleWheelScroll);
            }
        });
    });
},1200)

document.querySelectorAll('.toggle-password').forEach(button => {
  button.addEventListener('click', () => {
    const input = button.previousElementSibling;
    if (input.type === 'password') {
      input.type = 'text';
      button.textContent = '👁️';
    } else {
      input.type = 'password';
      button.textContent = '🙈';
    }
  });
});

function logOut(){
    localStorage.removeItem('user_session');
    window.location.href = "/coffee/index.html";
}