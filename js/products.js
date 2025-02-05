let products = [];

// fetch("https://tcb-backend-05330ab42436.herokuapp.com/api/search/products")
fetch("http://localhost:5001/api/search/products")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((productGroup) => {
      productGroup.variations.forEach((variation) => {
        const price = variation.item_variation_data.price_money
          ? variation.item_variation_data.price_money.amount / 100
          : "Price unavailable";

        const customAttributes = variation.custom_attribute_values || {};
        const brand =
          Object.values(customAttributes).find((attr) => attr.name === "Brand")
            ?.string_value || "Unknown Brand";

        let product = {
          product_group_id: productGroup.id,
          product_group_name: productGroup.name,
          variation_id: variation.id,
          variation_name: variation.item_variation_data.name,
          price: price,
          image: variation.images?.[0]?.url || "/images/placeholder.png",
          categories: productGroup.categories || [],
          inventory: variation.inventory,
          brand: brand,
        };

        products.push(product);
      });
    });

    renderProducts(products);

    ["search", "sort", "category"].forEach((id) => {
      document
        .getElementById(id)
        .addEventListener("input", filterAndSortProducts);
    });
  })
  .catch((error) => {
    console.error("Error fetching products:", error);
  });

function renderProducts(products) {
  const productsContainer = document.getElementById("products-container");

  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.innerHTML = `
     <div class="alert alert-light text-center py-5 border rounded shadow-sm mt-5" >
      <i class="bi bi-box-seam fs-1 text-secondary"></i>
      <h4 class="mt-3 text-dark">No products found</h4>
      <p class="text-muted small">Try searching for something else.</p>
    </div>
    `;
    return;
  }

  products.forEach((product) => {
    const inventory = parseInt(product.inventory, 10);

    const productCard = document.createElement("div");
    productCard.classList.add(
      "col-12",
      "col-sm-6",
      "col-md-4",
      "col-lg-3",
      "mb-4"
    );

    const buttonText = inventory === 0 ? "Out of Stock" : "Add to Cart";
    const buttonClass =
      inventory === 0
        ? "btn-sm w-100 add-to-cart-btn disabled"
        : "btn-sm w-100 add-to-cart-btn";

    productCard.innerHTML = `
      <div class="product">
        <h3 >${product.product_group_name}</h3>
        <img src= "${product.image}" alt="${
      product.variation_name
    }" class="img-fluid mb-2" style="max-height: 100px;">
        <small class="text-muted">${product.variation_name}</small>
        <strong class="text-dark price-container">$${product.price}</strong>
         <button type="submit" class="${buttonClass}" data-product='${JSON.stringify(
      product
    )}'>${buttonText}</button>
      </div>
    `;

    productsContainer.appendChild(productCard);
  });

  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      let product = JSON.parse(event.target.getAttribute("data-product"));
      addToCart(product);
    });
  });
}

function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const inventory = parseInt(product.inventory, 10);
  const existingItem = cart.find((item) => item.id === product.variation_id);

  if (existingItem) {
    if (existingItem.quantity < inventory) {
      existingItem.quantity += 1;
    } else {
      alert("Sorry, there's not enough stock available!");
    }
  } else {
    if (inventory > 0) {
      cart.push({
        id: product.variation_id,
        name: product.product_group_name,
        variation_name: product.variation_name,
        price: product.price,
        image: product.image,
        quantity: 1,
        inventory: product.inventory,
      });
    } else {
      alert("Sorry, this product is out of stock!");
    }
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartCount();
}

function filterAndSortProducts() {
  let query = document.getElementById("search").value.toLowerCase();
  let sort = document.getElementById("sort").value;
  let category = document.getElementById("category").value;

  let filteredProducts = products.filter(
    (product) =>
      product.product_group_name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query)
  );

  if (category) {
    filteredProducts = filteredProducts.filter((product) => {
      return product.categories.some((cat) =>
        cat.toLowerCase().includes(category.toLowerCase())
      );
    });
  }

  if (sort === "priceLow") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === "priceHigh") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  renderProducts(filteredProducts);
}
