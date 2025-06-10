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
      updateCartCount();
      confirmationModal();
    });

  fetch("/includes/footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.querySelector("footer").innerHTML = data;
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

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const quantity = cart.reduce((total, item) => total + item.quantity, 0);

  const cartCount = document.querySelectorAll(".cart-count");

  cartCount.forEach((element) => {
    element.textContent = quantity;
  });
}

function eventModal() {
  const modal = document.getElementById("event-modal");
  modal.style.display = "flex";
  
  const closeButton = modal.querySelector(".close-btn");

  closeButton.addEventListener("click", function () {
    modal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

eventModal();

function confirmationModal() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("transactionId")) {
    localStorage.removeItem("cart");
    updateCartCount()

    const modal = document.getElementById("thank-you-modal");

    const closeButton = modal.querySelector(".close-btn");;

    closeButton.addEventListener("click", function () {
      modal.style.display = "none";
    });

    modal.style.display = "flex";

    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }
}
