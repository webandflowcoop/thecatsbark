document.addEventListener("DOMContentLoaded", function () {
  fetch("/includes/header.html")
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

  fetch("/includes/footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.querySelector("footer").innerHTML = data;
    });

  fetch("/gallery/")
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

  const modal = document.getElementById("modal");
  const closeModalButton = document.getElementById("closeModal");
  closeModalButton.addEventListener("click", closeModal);

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });
});

function updateActivePageIndicator() {
  const currentPage = window.location.pathname.replace(/\/$/, "");
  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach((link) => {
    link.classList.remove("active");
  });

  navLinks.forEach((link) => {
    const linkPath = link.getAttribute("href").replace(/\/$/, "");
    if (linkPath === currentPage) {
      link.classList.add("active");
    }
  });
}

function openModal() {
  modal.classList.add("modal-open");
}

function closeModal() {
  modal.classList.remove("modal-open");
}
