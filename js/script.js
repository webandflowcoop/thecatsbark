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
      eventModal();
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
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("transactionId")) return;

  const modal = setupModal("event-modal");
  if (!modal) return;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function confirmationModal() {
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has("transactionId")) return;

  localStorage.removeItem("cart");
  updateCartCount();

  const modal = setupModal("thank-you-modal");
  if (!modal) return;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function setupModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return null;

  const closeButton = modal.querySelector(".close-btn");
  if (closeButton) {
    closeButton.addEventListener("click", () => closeModal(modal));
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal(modal);
  });

  return modal;
}

function closeModal(modal) {
  if (!modal) return;

  modal.style.display = "none";
  
  document.body.style.overflow = "";
}