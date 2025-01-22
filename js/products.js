let products = [];
// fetch("https://tcb-backend-05330ab42436.herokuapp.com/api/search/products")
fetch("http://localhost:5000/api/search/products")
  .then((response) => response.json())
  .then((data) => {
    products = data.map((product) => {
      const variations = product.variations.map((variation) => {
        const price = variation.item_variation_data.price_money
          ? variation.item_variation_data.price_money.amount / 100
          : "Price unavailable";

        return {
          variation_id: variation.id,
          variation_name: variation.item_variation_data.name,
          price: price,
          image: variation.images?.[0]?.url || "/images/placeholder.png", // TODO: This [0] is dangerous
        };
      });

      return {
        id: product.id,
        name: product.name,
        variations: variations,
        categories: product.categories || [],
      };
    });

    renderProducts(products);
  })
  .catch((error) => {
    console.error("Error fetching products:", error);
  });

function renderProducts(brands) {
  const productsContainer = document.getElementById("products-container");
  productsContainer.innerHTML = "";

  brands.forEach((brand) => {
    const productCard = document.createElement("div");
    productCard.classList.add(
      "col-12",
      "col-sm-6",
      "col-md-4",
      "col-lg-3",
      "mb-4"
    );
    productCard.innerHTML = `
      <div class="product">
        <h3>${brand.name}</h3>
        <ul>
          ${brand.variations
            .map(
              (product) => `
              <li class="mb-3">
                <img src= "${product.image}" alt="${product.variation_name}" class="img-fluid mb-2" style="max-height: 100px;">
                <div class="variation-details">
                  <p class="mb-1 text-secondary">${product.variation_name}</p>
                  <strong class="text-dark">$${product.price}</strong>
                </div>
              </li>`
            )
            .join("")}
        </ul>
        <small class="text-muted text-center mt-3">Click to view more details</small>
      </div>
    `;

    productCard.addEventListener("click", () => {
      showDetails(brand);
    });

    productsContainer.appendChild(productCard);
  });
}

function showDetails(brand) {
  const productsContainer = document.getElementById("products-container");
  productsContainer.innerHTML = `
        <div class="row">
          <div class="col-12 text-center mb-4">
             <h2 class="fw-bold">${brand.name}</h2>
          </div>
        </div>
        
        <div class="row">
          ${brand.variations
            .map(
              (variation) =>
                `<div class="col-md-4 mb-4">
                    <div class="card shadow-sm">
                      <div class="ratio ratio-1x1">
                        <img src="${variation.image}" class="card-img-top mt-3" alt="${variation.variation_name}" style="width: 100%; object-fit: contain;">
                      </div>
                      <div class="card-body">
                        <h5 class="card-title">${variation.variation_name}</h5>
                        <p class="card-text">$${variation.price}</p>
                        <button type="submit" class="btn-sm w-100 add-to-cart-btn" data-id="${variation.variation_id}" data-name="${variation.variation_name}" data-price="${variation.price}" data-image="${variation.image}">  Add to Cart </button>
                      </div>
                    </div>
                  </div>`
            )
            .join("")}
        </div>
        <div class="row">
          <div class="col-12 text-center mt-4">
            <button class="btn btn-primary" id="back-button">Back to Products</button>
          </div>
        </div>
  
    `;

  document.getElementById("back-button").addEventListener("click", () => {
    renderProducts(products);
  });

  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const variationId = event.target.getAttribute("data-id");
      const name = event.target.getAttribute("data-name");
      const price = event.target.getAttribute("data-price");
      const image = event.target.getAttribute("data-image");

      addToCart(variationId, name, price, image);
    });
  });
}

function addToCart(variationId, name, price, image) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItem = cart.find((item) => item.id === variationId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: variationId,
      name: name,
      price: price,
      image: image,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartCount();

  alert(`${name} added to cart!`);
}
