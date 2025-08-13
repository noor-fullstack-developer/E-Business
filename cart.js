import products from "./products.js";

const cart = () => {
  let listCartHTML = document.querySelector(".listCart");
  let iconCart = document.querySelector(".icon-cart");
  let iconCartSpan = iconCart.querySelector("span");
  let body = document.querySelector("body");
  let closeCart = document.querySelector(".close");
  let totalValueElement = document.querySelector(".total-value");
  let couponInput = document.querySelector("#coupon-code");
  let applyCouponBtn = document.querySelector("#apply-coupon");
  let discountValueElement = document.querySelector(".discount-value");
  
  let cart = [];
  let discountAmount = 0;
  
  //  coupons which can be applied
  const coupons = {
    NOOR50: { type: "flat", value: 50 }, 
    NOOR100: { type: "flat", value: 100 }, 
    NOOR150: { type: "flat", value: 150 }, 
    NOOR10: { type: "percent", value: 10 }, 
    NOOR20: { type: "percent", value: 20 }, 
    NOOR30: { type: "percent", value: 30 }, 
  };
  
  // Open/Close cart tab
  iconCart.addEventListener("click", () => {
    body.classList.toggle("activeTabCart");
  });
  closeCart.addEventListener("click", () => {
    body.classList.toggle("activeTabCart");
  });
  
  // Add or update product in cart
  const setProductInCart = (idProduct, value) => {
    let positionThisProductInCart = cart.findIndex(
      (item) => item.product_id == idProduct
    );

    if (value <= 0) {
      if (positionThisProductInCart >= 0) {
        cart.splice(positionThisProductInCart, 1);
      }
    } else if (positionThisProductInCart < 0) {
      cart.push({
        product_id: idProduct,
        quantity: 1,
      });
    } else {
      cart[positionThisProductInCart].quantity = value;
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    addCartToHTML();
  };
  
  //  ReRender cart in HTML
  const addCartToHTML = () => {
    listCartHTML.innerHTML = "";
    let totalQuantity = 0;
    let totalPrice = 0;
    
    if (cart.length > 0) {
      cart.forEach((item) => {
        totalQuantity += item.quantity;

        let product = products.find((p) => p.id == item.product_id);
        if (!product) return;
        
        let itemTotal = product.price * item.quantity;
        totalPrice += itemTotal;
        
        let newItem = document.createElement("div");
        newItem.classList.add("item");
        newItem.dataset.id = item.product_id;
        
        newItem.innerHTML = `
        <div class="image">
        <img src="${product.image}">
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
    }


    //  Apply discount
    let finalTotal = totalPrice - discountAmount;
    if (finalTotal < 0) finalTotal = 0;

    iconCartSpan.innerText = totalQuantity;
    discountValueElement.innerText =
      discountAmount > 0 ? `Discount: -$${discountAmount.toFixed(2)}` : "";
    totalValueElement.innerText = `Total: $${finalTotal.toFixed(2)}`;
  };

  //  Apply coupon logic
  const applyCoupon = () => {
    let code = couponInput.value.trim().toUpperCase();
    discountAmount = 0;

    if (coupons[code]) {
      let coupon = coupons[code];
      let totalPrice = cart.reduce((sum, item) => {
        let product = products.find((p) => p.id == item.product_id);
        return product ? sum + product.price * item.quantity : sum;
      }, 0);

      if (coupon.type === "flat") {
        discountAmount = coupon.value;
      } else if (coupon.type === "percent") {
        discountAmount = (totalPrice * coupon.value) / 100;
      }
    } else {
      alert("Invalid coupon code!");
    }

    addCartToHTML();
  };

  //  click coupon apply button
  applyCouponBtn.addEventListener("click", applyCoupon);

  //  Load cart from localStorage
  let savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    addCartToHTML();
  }

  //   for clicks listner
  document.addEventListener("click", (event) => {
    let buttonClick = event.target;
    let idProduct = buttonClick.dataset.id;
    if (!idProduct) return;

    let positionProductInCart = cart.findIndex(
      (item) => item.product_id == idProduct
    );

    if (buttonClick.classList.contains("addCart")) {
      let quantity =
        positionProductInCart < 0
          ? 1
          : cart[positionProductInCart].quantity + 1;
      setProductInCart(idProduct, quantity);
    }

    if (buttonClick.classList.contains("minus")) {
      let quantity = cart[positionProductInCart].quantity - 1;
      setProductInCart(idProduct, quantity);
    }

    if (buttonClick.classList.contains("plus")) {
      let quantity = cart[positionProductInCart].quantity + 1;
      setProductInCart(idProduct, quantity);
    }
  });
};


export default cart;
