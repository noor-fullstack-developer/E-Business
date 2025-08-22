// detail.js

import products from "./products.js"; // Your product list file



// Select DOM elements (may not exist on every page, so guard later)
const detailContainer = document.querySelector(".detail");
const imgElement = detailContainer?.querySelector(".image img");
const nameElement = detailContainer?.querySelector(".name");
const priceElement = detailContainer?.querySelector(".price");
const descriptionElement = detailContainer?.querySelector(".description");
const ShipElement = detailContainer?.querySelector(".Ship");
const listProductElement = document.querySelector(".listProduct");
const addCartButton = document.querySelector(".addCart");

/* ---------------- Product Detail ---------------- */

// Get product id from URL
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Format price
function formatPrice(price) {
  const num = Number(price) || 0;
  return `₹${num.toLocaleString("en-IN")}`;
}

// Show product details
function showProductDetail(product) {
  if (!product) {
    if (nameElement) nameElement.textContent = "Product Not Found";
    return;
  }

  if (imgElement) imgElement.src = product.image;
  if (nameElement) nameElement.textContent = product.name;
  if (priceElement) priceElement.textContent = formatPrice(product.price);
  if (descriptionElement)
    descriptionElement.textContent =
      product.description || "No description available";
  if (ShipElement)
    ShipElement.textContent = product.Ship || "No update available";

  // Add to cart click
  if (addCartButton) {
    addCartButton.addEventListener("click", () => {
      addToCart(product.id);
      alert("Product has been added")
    });
  }
}

// Show similar products
function showSimilarProducts(category, currentId) {
  if (!listProductElement) return;

  const similar = products.filter(
    (p) => p.category === category && p.id !== currentId
  );

  listProductElement.innerHTML = "";

  similar.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("item");

    div.innerHTML = `
      <a href="detail.html?id=${item.id}"><img src="${item.image}" alt="${item.name}" /></a>
      <a href="detail.html?id=${item.id}"><h2>${item.name}</h2></a>
      <a href="detail.html?id=${item.id}"><div class="price">${formatPrice(item.price)}</div></a>
      <a href="detail.html?id=${item.id}">View Detail</a>
    `;

    listProductElement.appendChild(div);
  });
}

/* ---------------- Cart Logic ---------------- */

// Add to cart (unified format)
function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const index = cart.findIndex((item) => item.product_id == id);

  if (index < 0) {
    cart.push({ product_id: id, quantity: 1 });
  } else {
    cart[index].quantity += 1;
  }

  localStorage.setItem("cart", JSON.stringify(cart));
}

// Normalize old cart data (convert [1,2,3] → [{product_id, quantity:1}])
function normalizeCart(raw) {
  if (!Array.isArray(raw)) return [];
  if (raw.length && typeof raw[0] === "number") {
    return raw.map((id) => ({ product_id: id, quantity: 1 }));
  }
  return raw;
}

/* ---------------- Init ---------------- */

(function initDetailPage() {
  const id = getProductId();
  const product = products.find((p) => p.id == id);

  showProductDetail(product);

  if (product) {
    showSimilarProducts(product.category, product.id);
  }
})();

/* ---------------- Cart UI ---------------- */

const initCartUI = () => {
  // DOM Elements
  const listCartHTML = document.querySelector(".listCart");
  const iconCart = document.querySelector(".icon-cart");
  const iconCartSpan = iconCart?.querySelector("span");
  const body = document.querySelector("body");
  const closeCart = document.querySelector(".close");
  const totalValueElement = document.querySelector(".total-value");
  const couponInput = document.querySelector("#coupon-code");
  const applyCouponBtn = document.querySelector("#apply-coupon");
  const discountValueElement = document.querySelector(".discount-value");
  const but = document.querySelector(".but");

  // State
  let cartItems = [];
  let discountAmount = 0;

  // Coupon Codes
  const coupons = {
    NOOR50: { type: "flat", value: 50 },
    NOOR100: { type: "flat", value: 100 },
    NOOR150: { type: "flat", value: 150 },
    NOOR10: { type: "percent", value: 10 },
    NOOR20: { type: "percent", value: 20 },
    NOOR30: { type: "percent", value: 30 },
  };

  /* Dark Mode Toggle */
  if (but) {
    but.addEventListener("click", () => {
      const isDark = body.classList.toggle("dark-mode");
      localStorage.setItem("dark-mode", isDark);
      but.innerHTML = isDark ? "☀️" : "🌙";
    });

    if (localStorage.getItem("dark-mode") === "true") {
      body.classList.add("dark-mode");
      but.innerHTML = "☀️";
    }
  }

  /* Cart Open/Close */
  if (iconCart) {
    iconCart.addEventListener("click", () => {
      body.classList.toggle("activeTabCart");
    });
  }
  if (closeCart) {
    closeCart.addEventListener("click", () => {
      body.classList.remove("activeTabCart");
    });
  }

  /* Update Cart (Add/Remove/Set) */
  const setProductInCart = (idProduct, value) => {
    const index = cartItems.findIndex((item) => item.product_id == idProduct);

    if (value <= 0) {
      if (index >= 0) cartItems.splice(index, 1);
    } else if (index < 0) {
      cartItems.push({ product_id: idProduct, quantity: value });
    } else {
      cartItems[index].quantity = value;
    }

    saveCart();
    renderCart();
  };

  /* Render Cart */
  const renderCart = () => {
    if (!listCartHTML) return;

    listCartHTML.innerHTML = "";
    let totalQuantity = 0;
    let totalPrice = 0;

    cartItems.forEach((item) => {
      const product = products.find((p) => p.id == item.product_id);
      if (!product) return;

      const unitPrice = Number(product.price) || 0;
      const qty = Number(item.quantity) || 0;
      const itemTotal = unitPrice * qty;

      totalPrice += itemTotal;
      totalQuantity += qty;

      const newItem = document.createElement("div");
      newItem.classList.add("item");
      newItem.dataset.id = item.product_id;

      newItem.innerHTML = `
        <div class="image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="name">${product.name}</div>
        <div class="totalPrice">${formatPrice(itemTotal)}</div>
        <div class="quantity">
          <span class="minus" data-id="${product.id}">-</span>
          <span>${qty}</span>
          <span class="plus" data-id="${product.id}">+</span>
        </div>
      `;

      listCartHTML.appendChild(newItem);
    });

    // Apply discount
    let finalTotal = totalPrice - discountAmount;
    if (finalTotal < 0) finalTotal = 0;

    if (iconCartSpan) iconCartSpan.innerText = totalQuantity;
    if (discountValueElement)
      discountValueElement.innerText =
        discountAmount > 0 ? `Discount: -${formatPrice(discountAmount)}` : "";
    if (totalValueElement)
      totalValueElement.innerText = `Total: ${formatPrice(finalTotal)}`;
  };

  /* Apply Coupon */
  const applyCoupon = () => {
    const code = couponInput?.value.trim().toUpperCase();
    discountAmount = 0;

    if (coupons[code]) {
      const coupon = coupons[code];
      const totalPrice = cartItems.reduce((sum, item) => {
        const product = products.find((p) => p.id == item.product_id);
        return product
          ? sum + (Number(product.price) || 0) * (Number(item.quantity) || 0)
          : sum;
      }, 0);

      if (coupon.type === "flat") {
        discountAmount = coupon.value;
      } else if (coupon.type === "percent") {
        discountAmount = (totalPrice * coupon.value) / 100;
      }
    } else if (code) {
      alert("Invalid coupon code!");
    }

    renderCart();
  };

  if (applyCouponBtn) applyCouponBtn.addEventListener("click", applyCoupon);

  const saveCart = () => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  };

  const loadCart = () => {
    try {
      const saved = localStorage.getItem("cart");
      const parsed = saved ? JSON.parse(saved) : [];
      cartItems = normalizeCart(parsed);
    } catch {
      cartItems = [];
    }
    renderCart();
  };

  document.addEventListener("click", (event) => {
    const target = event.target;
    const idProduct = target.dataset.id;
    if (!idProduct) return;

    const index = cartItems.findIndex((item) => item.product_id == idProduct);

    if (target.classList.contains("addCart")) {
      const quantity = index < 0 ? 1 : cartItems[index].quantity + 1;
      setProductInCart(idProduct, quantity);
    }

    if (target.classList.contains("minus")) {
      if (index >= 0) {
        setProductInCart(idProduct, cartItems[index].quantity - 1);
      }
    }

    if (target.classList.contains("plus")) {
      if (index >= 0) {
        setProductInCart(idProduct, cartItems[index].quantity + 1);
      }
    }
  });

  loadCart();
};

export default initCartUI;
