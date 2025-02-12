let products = [];
let filteredProducts = [];
let currentPage = 1;

showSkeletons(8);

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
          product_group_seo:
            productGroup.seo?.page_description || "No Description Available",
        };

        products.push(product);
      });
    });

    filteredProducts = [...products];
    renderProducts(filteredProducts, currentPage);

    ["search", "sort", "category"].forEach((id) => {
      document
        .getElementById(id)
        .addEventListener("input", filterAndSortProducts);
    });
  })
  .catch((error) => {
    console.error("Error fetching products:", error);
  });

function renderProductsOG(products, page = 1, itemsPerPage = 8) {
  const productsContainer = document.getElementById("products-container");
  const paginationContainer = document.getElementById("pagination-controls");

  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.innerHTML = `
     <div class="alert alert-light text-center py-5 border rounded shadow-sm mt-5" >
      <i class="bi bi-box-seam fs-1 text-secondary"></i>
      <h4 class="mt-3 text-dark">No products found</h4>
      <p class="text-muted small">Try searching for something else.</p>
    </div>
    `;
    paginationContainer.innerHTML = "";
    return;
  }

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  paginatedProducts.forEach((product) => {
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
      <div class="product text-center p-3 border rounded shadow-sm">
        <h3 >${product.product_group_name}</h3>
        <img src= "${product.image}" alt="${product.variation_name}" class="img-fluid mb-2 product-image" style="max-height: 120px; object-fit: contain;"  loading="lazy">
        <small class="text-muted">${product.variation_name}</small>
        <strong class="text-dark price-container">$${product.price}</strong>
         <button type="submit" class="${buttonClass}" product-id='${product.variation_id}'>${buttonText}</button>
      </div>
    `;

    productsContainer.appendChild(productCard);
  });

  renderPaginationControls(totalPages, page);

  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    if (!button.classList.contains("disabled")) {
      button.addEventListener("click", (event) => {
        let product = products.find(
          (p) => p.variation_id == event.target.getAttribute("product-id")
        );
        if (product) {
          addToCart(product);
        } else {
          console.warn(
            `Could not find product with id ${product.variation_id}`
          );
        }
      });
    }
  });

  document.querySelectorAll(".product-image").forEach((img) => {
    img.addEventListener("click", (event) => {
      let productContainer = event.target.closest(".product");

      if (productContainer) {
        let button = productContainer.querySelector("button[product-id]");
        if (button) {
          let product = products.find(
            (p) => p.variation_id == button.getAttribute("product-id")
          );
          if (product) {
            try {
              openProductModal(product);
            } catch (error) {
              console.error("Error parsing JSON:", error);
            }
          } else {
            console.warn(
              `Could not find product with id ${product.variation_id}`
            );
          }
        }
      }
    });
  });
}

function renderProducts(products, page = 1, itemsPerPage = 8) {
  const productsContainer = document.getElementById("products-container");
  const paginationContainer = document.getElementById("pagination-controls");

  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.innerHTML = `
     <div class="alert alert-light text-center py-5 border rounded shadow-sm mt-5" >
      <i class="bi bi-box-seam fs-1 text-secondary"></i>
      <h4 class="mt-3 text-dark">No products found</h4>
      <p class="text-muted small">Try searching for something else.</p>
    </div>
    `;
    paginationContainer.innerHTML = "";
    return;
  }

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const inStockProducts = products.filter(
    (product) => parseInt(product.inventory) > 0
  );
  const outOfStockProducts = products.filter(
    (product) => parseInt(product.inventory) === 0
  );

  const totalPages = Math.ceil(inStockProducts.length / itemsPerPage);

  const inStockPaginated = inStockProducts.slice(startIndex, endIndex);
  const outOfStockPaginated = outOfStockProducts.slice(startIndex, endIndex);

  if (inStockPaginated.length > 0) {
    const inStockSection = document.createElement("div");
    inStockSection.innerHTML = `
      <div class="row g-4" id="in-stock-products"></div>
    `;
    productsContainer.appendChild(inStockSection);

    const inStockContainer = inStockSection.querySelector("#in-stock-products");
    inStockPaginated.forEach((product) => {
      const productCard = createProductCard(product, false);
      inStockContainer.appendChild(productCard);
    });
  }

  if (outOfStockPaginated.length > 0) {
    const outOfStockSection = document.createElement("div");
    outOfStockSection.innerHTML = `
      <h3 class="text-center mt-4">Temporarily Out of Stock</h3>
      <div class="row g-4" id="out-of-stock-products"></div>
    `;
    productsContainer.appendChild(outOfStockSection);

    const outOfStockContainer = outOfStockSection.querySelector(
      "#out-of-stock-products"
    );
    outOfStockPaginated.forEach((product) => {
      const productCard = createProductCard(product, true);
      outOfStockContainer.appendChild(productCard);
    });
  }

  renderPaginationControls(totalPages, page);

  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    if (!button.classList.contains("disabled")) {
      button.addEventListener("click", (event) => {
        let product = products.find(
          (p) => p.variation_id == event.target.getAttribute("product-id")
        );
        if (product) {
          addToCart(product);
        } else {
          console.warn(
            `Could not find product with id ${product.variation_id}`
          );
        }
      });
    }
  });

  document.querySelectorAll(".product-image").forEach((img) => {
    img.addEventListener("click", (event) => {
      let productContainer = event.target.closest(".product");

      if (productContainer) {
        let button = productContainer.querySelector("button[product-id]");
        if (button) {
          let product = products.find(
            (p) => p.variation_id == button.getAttribute("product-id")
          );
          if (product) {
            try {
              openProductModal(product);
            } catch (error) {
              console.error("Error parsing JSON:", error);
            }
          } else {
            console.warn(
              `Could not find product with id ${product.variation_id}`
            );
          }
        }
      }
    });
  });
}

function createProductCard(product, isOutOfStock) {
  const buttonText = isOutOfStock ? "Out of Stock" : "Add to Cart";
  const buttonClass = isOutOfStock
    ? "btn-sm w-100 add-to-cart-btn disabled"
    : "btn-sm w-100 add-to-cart-btn";

  const productCard = document.createElement("div");
  productCard.classList.add(
    "col-12",
    "col-sm-6",
    "col-md-4",
    "col-lg-3",
    "mb-4"
  );

  productCard.innerHTML = `
    <div class="product text-center p-3 border rounded shadow-sm">
      <h3>${product.product_group_name}</h3>
      <img src="${product.image}" alt="${product.variation_name}" class="img-fluid mb-2 product-image" style="max-height: 120px; object-fit: contain;" loading="lazy">
      <small class="text-muted">${product.variation_name}</small>
      <strong class="text-dark price-container">$${product.price}</strong>
      <button type="submit" class="${buttonClass}" product-id='${product.variation_id}'>${buttonText}</button>
    </div>
  `;

  return productCard;
}

function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const inventory = parseInt(product.inventory, 10);
  const existingItem = cart.find((item) => item.id === product.variation_id);

  if (existingItem) {
    if (existingItem.quantity < inventory) {
      existingItem.quantity += 1;
      showToast("Product added to cart", "primary");
    } else {
      showToast("Sorry, there's not enough stock available!");
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
      showToast("Product added to cart", "primary");
    } else {
      showToast("Sorry, this product is out of stock!");
    }
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartCount();
}

function filterAndSortProducts() {
  let query = document.getElementById("search").value.toLowerCase();
  let sort = document.getElementById("sort").value;
  let category = document.getElementById("category").value;

  filteredProducts = products.filter(
    (product) =>
      product.product_group_name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query)
  );

  if (category) {
    filteredProducts = filteredProducts.filter((product) =>
      product.categories.some(
        (cat) => cat.toLowerCase() === category.toLowerCase()
      )
    );
  }

  if (sort === "priceLow") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === "priceHigh") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  renderProducts(filteredProducts);
}

function renderPaginationControls(totalPages, currentPage) {
  const paginationContainer = document.getElementById("pagination-controls");
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return;

  let paginationHTML = `<ul class="pagination justify-content-center">`;

  paginationHTML += `<li class="page-item ${
    currentPage === 1 ? "disabled" : ""
  }">
    <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">
      <span>&laquo;</span> <span class="d-none d-sm-inline">Previous</span>
    </a>
  </li>`;

  if (window.innerWidth < 576) {
    if (currentPage > 1) {
      paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${
        currentPage - 1
      })">${currentPage - 1}</a></li>`;
    }

    paginationHTML += `<li class="page-item active">
      <span class="page-link">${currentPage}</span>
    </li>`;

    if (currentPage < totalPages) {
      paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${
        currentPage + 1
      })">${currentPage + 1}</a></li>`;
    }
  } else {
    if (currentPage > 3) {
      paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(1)">1</a></li>`;
      if (currentPage > 4) {
        paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
    }

    for (
      let i = Math.max(1, currentPage - 2);
      i <= Math.min(totalPages, currentPage + 2);
      i++
    ) {
      paginationHTML += `<li class="page-item ${
        i === currentPage ? "active" : ""
      }">
        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
      </li>`;
    }

    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
      paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a></li>`;
    }
  }

  paginationHTML += `<li class="page-item ${
    currentPage === totalPages ? "disabled" : ""
  }">
    <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">
      <span class="d-none d-sm-inline">Next</span> <span>&raquo;</span>
    </a>
  </li>`;

  paginationHTML += `</ul>`;
  paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
  if (page < 1) return;
  if (page > Math.ceil(filteredProducts.length / 8)) return;

  currentPage = page;
  renderProducts(filteredProducts, currentPage);
}

function openProductModal(product) {
  const modalContainer = document.getElementById("products-container-modal");
  const modal = document.createElement("div");
  modal.id = "productModal";
  modal.classList.add("custom-modal");
  modal.setAttribute("aria-hidden", "true");

  modal.innerHTML = `
  <div class="custom-modal-container">
    <div class="modal-header">
      <h3 id="productModalLabel" class="card-title">${product.product_group_name}</h3>
      <button class="btn-close-modal" aria-label="Close">&times;</button>
    </div>
    <div style="text-align:center" class="d-flex justify-content-center">
      <img id="modalProductImage" src="${product.image}" alt="${product.variation_name}" class="m-3" loading="lazy" />
    </div>
    <p id="modalProductDescription">${product.product_group_seo}</p>
    <p id="modalProductPrice"><strong>$${product.price}</strong></p>
  </div>
`;

  modalContainer.appendChild(modal);

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");

  modal.querySelector(".btn-close-modal").focus();

  modal.querySelector(".btn-close-modal").addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  function closeModal() {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    modalContainer.removeChild(modal);
  }
}

function showToast(message, type = "warning") {
  let toastContainer = document.getElementById("toast-container");

  if (!toastContainer) return;

  let toastElement = document.createElement("div");
  toastElement.className = `toast custom-toast bg-${type}`;
  toastElement.setAttribute("role", "alert");
  toastElement.setAttribute("aria-live", "assertive");
  toastElement.setAttribute("aria-atomic", "true");

  toastElement.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toastElement);

  let toast = new bootstrap.Toast(toastElement);
  toast.show();

  setTimeout(() => {
    toastElement.remove();
  }, 3500);
}

function showSkeletons(count = 8) {
  const productsContainer = document.getElementById("products-container");
  productsContainer.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const skeletonCard = document.createElement("div");
    skeletonCard.classList.add(
      "col-12",
      "col-sm-6",
      "col-md-4",
      "col-lg-3",
      "mb-4"
    );
    skeletonCard.innerHTML = `
      <div class="product skeleton text-center p-3 border rounded shadow-sm">
        <div class="skeleton-image mb-2"></div>
        <div class="skeleton-text skeleton-title mb-1"></div>
        <div class="skeleton-text skeleton-subtitle mb-2"></div>
        <div class="skeleton-text skeleton-price mb-2"></div>
        <div class="skeleton-button"></div>
      </div>
    `;
    productsContainer.appendChild(skeletonCard);
  }
}
