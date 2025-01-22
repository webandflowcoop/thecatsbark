function renderCart() {
  const cartContainer = document.getElementById("cart-container");

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    cartContainer.innerHTML = `
        <div class="text-center">
          <h3>Your cart is empty!</h3>
          <a href="/products" class="btn btn-primary mt-3">Continue Shopping</a>
        </div>
      `;
    return;
  }

  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    cartContainer.innerHTML = `
    ${cart
      .map(
        (item) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-details">
            <h5>${item.name}</h5>
            <p>Price: $${item.price}</p>
            <p>Quantity: 
              <input type="number" class="quantity-input" data-id="${
                item.id
              }" value="${item.quantity}" min="1">
            </p>
            <p>Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
            <button class="btn remove remove-button" data-id="${
              item.id
            }"><i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      `
      )
      .join("")}
    <div class="text-end mt-3">
      <h5>Total: $${calculateTotal(cart).toFixed(2)}</h5>
      <button id="checkout-btn" class="btn btn-success mt-3 px-4">Checkout</button>
    </div>
  `;
  } else {
    cartContainer.innerHTML = `
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th class="table-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${cart
            .map(
              (item) => `
            <tr>
              <td>
                <div class="d-flex align-items-center">
                  <img src="${item.image}" alt="${
                item.name
              }" class="me-3" style="width: 50px; height: 50px; object-fit: cover;">
                  <span>${item.name}</span>
                </div>
              </td>
              <td class="align-middle">$${item.price}</td>
              <td class="align-middle">
                <input type="number" class="form-control form-control-sm quantity-input" data-id="${
                  item.id
                }" value="${item.quantity}" min="1">
              </td>
              <td class="align-middle" >$${(item.price * item.quantity).toFixed(
                2
              )}</td>
              <td class="table-cell align-middle">
                <button class="btn remove remove-button" data-id="${
                  item.id
                }"><i class="fa-regular fa-trash-can"></i></button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      <div class="text-end mt-3">
        <h5>Total: $${calculateTotal(cart).toFixed(2)}</h5>
        <button id="checkout-btn" class="btn btn-success mt-3 px-4">Reserve</button>
      </div>
    `;
  }
  document.querySelectorAll(".quantity-input").forEach((input) => {
    input.addEventListener("change", (event) => {
      const itemId = event.target.getAttribute("data-id");
      const newQuantity = parseInt(event.target.value);
      updateCartItem(itemId, newQuantity);
    });
  });

  document.querySelectorAll(".remove-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const itemId = button.getAttribute("data-id");
      removeFromCart(itemId);
    });
  });

  const checkoutButton = document.getElementById("checkout-btn");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      openModal();
    });
  }

  const modal = document.getElementById("modal");

  const closeModalButton = document.getElementById("closeModal");
  closeModalButton.addEventListener("click", closeModal);
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  document
    .getElementById("checkout-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const userName = document.getElementById("name").value;
      const userEmail = document.getElementById("email").value;
      const userPhone = document.getElementById("phone").value;

      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      const emailContent = `
    <h2>New Order</h2>
    <p><strong>Name:</strong> ${userName}</p>
    <p><strong>Email:</strong> ${userEmail}</p>
    <p><strong>Phone:</strong> ${userPhone}</p>
    <h3>Order Details:</h3>
    <ul>
      ${cart
        .map(
          (item) =>
            `<li>${item.name} - $${item.price} x ${item.quantity} = $${(
              item.price * item.quantity
            ).toFixed(2)}</li>`
        )
        .join("")}
    </ul>
    <h4>Total: $${calculateTotal(cart).toFixed(2)}</h4>
    <p><strong>Note:</strong> This is a pick-up only order. Payment will be made in-store.</p>
  `;

      alert(emailContent);
    });
}

function calculateTotal(cart) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function updateCartItem(itemId, newQuantity) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart.find((item) => item.id === itemId);

  if (item) {
    item.quantity = newQuantity;
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    updateCartCount();
  }
}

function removeFromCart(itemId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((item) => item.id !== itemId);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

function openModal() {
  modal.classList.add("modal-open");
}

function closeModal() {
  modal.classList.remove("modal-open");
}

function setupCartRendering() {
  let currentIsMobile = window.innerWidth <= 768;

  function handleResize() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile !== currentIsMobile) {
      currentIsMobile = isMobile;
      renderCart();
    }
  }

  window.addEventListener("resize", handleResize);
  renderCart();
}

setupCartRendering();

window.addEventListener("load", renderCart);
