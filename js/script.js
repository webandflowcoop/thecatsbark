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
      eventModal();
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

  closeButton.addEventListener("click", () => closeModal(modal));

  const outsideClickHandler = (event) => {
    if (event.target === modal) closeModal(modal);
  };

  // reference for cleanup
  modal._outsideClickHandler = outsideClickHandler;
  window.addEventListener("click", outsideClickHandler);

  return modal;
}


function closeModal(modal) {
  if (!modal) return;

  modal.style.display = "none";

  if (modal._outsideClickHandler) {
    window.removeEventListener("click", modal._outsideClickHandler);
    delete modal._outsideClickHandler;
  }

  const modalElements = document.querySelectorAll(".modal, .event-modal");

  const modalArray = Array.from(modalElements);

  let anyOpen = false;
  for (const m of modalArray) {
    if (m.style.display === "flex") {
      anyOpen = true;
      break;
    }
  }

  document.body.style.overflow = anyOpen ? "hidden" : "";
}

