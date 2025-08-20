import products from "./products.js";

const cart = () => {
  // DOM Elements
  const listCartHTML = document.querySelector(".listCart");
  const iconCart = document.querySelector(".icon-cart");
  const iconCartSpan = iconCart.querySelector("span");
  const body = document.querySelector("body");
  const closeCart = document.querySelector(".close");
  const totalValueElement = document.querySelector(".total-value");
  const couponInput = document.querySelector("#coupon-code");
  const applyCouponBtn = document.querySelector("#apply-coupon");
  const discountValueElement = document.querySelector(".discount-value");
  const but = document.querySelector(".but");

  // State
  let cart = [];
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
  but.addEventListener("click", () => {
    const isDark = body.classList.toggle("dark-mode");
    localStorage.setItem("dark-mode", isDark);
    but.innerHTML = isDark ? "🌞" : "🌙";
  });

  // Restore dark mode from localStorage
  if (localStorage.getItem("dark-mode") === "true") {
    body.classList.add("dark-mode");
    but.innerHTML = "🌞";
  }

  /* Cart Open/Close */
  iconCart.addEventListener("click", () => {
    body.classList.toggle("activeTabCart");
  });
  closeCart.addEventListener("click", () => {
    body.classList.remove("activeTabCart");
  });

  /* Update Cart (Add/Remove/Set) */
  const setProductInCart = (idProduct, value) => {
    const index = cart.findIndex((item) => item.product_id == idProduct);

    if (value <= 0) {
      if (index >= 0) cart.splice(index, 1);
    } else if (index < 0) {
      cart.push({ product_id: idProduct, quantity: value });
    } else {
      cart[index].quantity = value;
    }

    saveCart();
    renderCart();
  };

  /* Render Cart */
  const renderCart = () => {
    listCartHTML.innerHTML = "";
    let totalQuantity = 0;
    let totalPrice = 0;

    cart.forEach((item) => {
      const product = products.find((p) => p.id == item.product_id);
      if (!product) return;

      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;
      totalQuantity += item.quantity;

      const newItem = document.createElement("div");
      newItem.classList.add("item");
      newItem.dataset.id = item.product_id;

      newItem.innerHTML = `
        <div class="image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="name">${product.name}</div>
        <div class="totalPrice">\$${itemTotal.toFixed(2)}</div>
        <div class="quantity">
          <span class="minus" data-id="${product.id}">-</span>
          <span>${item.quantity}</span>
          <span class="plus" data-id="${product.id}">+</span>
        </div>
      `;

      listCartHTML.appendChild(newItem);
    });

    // Apply discount
    let finalTotal = totalPrice - discountAmount;
    if (finalTotal < 0) finalTotal = 0;

    iconCartSpan.innerText = totalQuantity;
    discountValueElement.innerText =
      discountAmount > 0 ? `Discount: -$${discountAmount.toFixed(2)}` : "";
    totalValueElement.innerText = `Total: $${finalTotal.toFixed(2)}`;
  };

  /* Apply Coupon */
  const applyCoupon = () => {
    const code = couponInput.value.trim().toUpperCase();
    discountAmount = 0;

    if (coupons[code]) {
      const coupon = coupons[code];
      const totalPrice = cart.reduce((sum, item) => {
        const product = products.find((p) => p.id == item.product_id);
        return product ? sum + product.price * item.quantity : sum;
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

  applyCouponBtn.addEventListener("click", applyCoupon);

  const saveCart = () => {
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const loadCart = () => {
    try {
      const saved = localStorage.getItem("cart");
      cart = saved ? JSON.parse(saved) : [];
    } catch {
      cart = [];
    }
    renderCart();
  };

  document.addEventListener("click", (event) => {
    const target = event.target;
    const idProduct = target.dataset.id;
    if (!idProduct) return;

    const index = cart.findIndex((item) => item.product_id == idProduct);

    if (target.classList.contains("addCart")) {
      const quantity = index < 0 ? 1 : cart[index].quantity + 1;
      setProductInCart(idProduct, quantity);
    }

    if (target.classList.contains("minus")) {
      if (index >= 0) {
        setProductInCart(idProduct, cart[index].quantity - 1);
      }
    }

    if (target.classList.contains("plus")) {
      if (index >= 0) {
        setProductInCart(idProduct, cart[index].quantity + 1);
      }
    }
  });

  loadCart();
};

export default cart;
