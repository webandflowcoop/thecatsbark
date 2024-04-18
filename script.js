document.addEventListener("DOMContentLoaded", function () {
  fetch("header.html")
    .then((response) => response.text())
    .then((data) => {
      document.querySelector("header").innerHTML = data;
      const menuIcon = document.getElementById("menu-icon");
      const menuItems = document.querySelector(".menu");

      if (menuIcon) {
        menuIcon.addEventListener("click", function () {
          menuItems.classList.toggle("show");
        });
      }
      updateActivePageIndicator();
    });

  fetch("footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.querySelector("footer").innerHTML = data;
    });

  fetch("gallery.html")
    .then((response) => response.text())
    .then((data) => {
      let slideIndex = 0;
      function changeSlide(n) {
        const slides = document.querySelectorAll(".slides img");
        slideIndex += n;
        if (slideIndex >= slides.length) {
          slideIndex = 0;
        }
        if (slideIndex < 0) {
          slideIndex = slides.length - 1;
        }
        for (let i = 0; i < slides.length; i++) {
          slides[i].style.transform = `translateX(-${slideIndex * 100}%)`;
        }
      }

      const arrowLeft = document.getElementById("arrow-left");

      if (arrowLeft) {
        arrowLeft.addEventListener("click", function () {
          moveSlide(-1);
        });
      }

      const arrowRight = document.getElementById("arrow-right");
      if (arrowRight) {
        arrowRight.addEventListener("click", function () {
          moveSlide(1);
        });
      }

      function moveSlide(direction) {
        changeSlide(direction);
      }

      setInterval(function () {
        moveSlide(1);
      }, 3000);
    });
});

function updateActivePageIndicator() {
  const currentPage = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach((link) => {
    link.classList.remove("active");
  });

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
}
