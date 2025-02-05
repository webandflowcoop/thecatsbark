function renderCart() {
  const cartContainer = document.getElementById("cart-container");

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    cartContainer.innerHTML = `
        <div class="text-center">
             <img
              src="/images/empty-cart.png"
              alt="Smilling cat inside of shopping cart with 0 items"
              class="empty-cart-image"
            />
            <br/>
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
            <h5>${item.name} - <small>${item.variation_name}</small></h5>
            <p>Price: $${item.price}</p>
            <p>Quantity: 
              <input type="number" class="quantity-input" data-id="${
                item.id
              }" data-inventory="${item.inventory}" value="${
          item.quantity
        }" min="1" max="${item.inventory}">
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
                  <span>${item.name} - <small>${
                item.variation_name
              }</small></span>
                </div>
              </td>
              <td class="align-middle">$${item.price}</td>
              <td class="align-middle">
                <input type="number" class="form-control form-control-sm quantity-input" data-id="${
                  item.id
                }" data-inventory="${item.inventory}" value="${
                item.quantity
              }" min="1" max="${item.inventory}">
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
        <button id="checkout-btn" class="btn btn-success mt-3 px-4">Checkout</button>
      </div>
    `;
  }

  document.querySelectorAll(".quantity-input").forEach((input) => {
    input.addEventListener("change", (event) => {
      console.log(event);
      const itemId = event.target.getAttribute("data-id");
      const maxInventory = event.target.getAttribute("data-inventory");
      const newQuantity = parseInt(event.target.value);
      if (parseInt(input.value, 10) > maxInventory) {
        event.target.value = maxInventory;
      }
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
      const userConfirmed = confirm(
        "You will be redirected to an external Square checkout page to complete your payment. Do you wish to proceed?" // Add that they woill b redirected to a external square site for payment processing
      );

      if (!userConfirmed) {
        return;
      }

      fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cart),
      })
        .then((response) => response.json())
        .then((data) => {
          window.location.href = data.checkout_url;
        })
        .catch((error) => console.error("Error:", error));
    });
  }
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

function clearCart() {
  localStorage.removeItem("cart");
  updateCartCount();
  renderCart();
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