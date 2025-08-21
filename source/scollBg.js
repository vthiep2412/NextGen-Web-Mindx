window.addEventListener("scroll", function () {
  let scrollPosition = window.scrollY;
  let triggerElement = document.querySelector(".trigger"); // Adjust this to your specific element
  let triggerPoint = triggerElement.offsetTop;

  if (scrollPosition >= triggerPoint) {
    document.body.style.backgroundAttachment = "fixed";
  } else {
    document.body.style.backgroundAttachment = "scroll";
  }
});