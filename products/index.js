import products from './products.js';
import cart from './cart.js';

let app = document.getElementById('app');
let temporaryContent = document.getElementById('temporaryContent');

let productPerPage = 3; // default
let livePage = 1;
let filteredProducts = [...products];
let searchQuery = "";
let selectedPriceRange = "";

// Pagination + filter + search
function getPaginationProduct(page) {
  const startIndex = (page - 1) * productPerPage;
  const endIndex = startIndex + productPerPage;
  return filteredProducts.slice(startIndex, endIndex);
}

function renderPage(page) {
  let listProductHTML = document.querySelector('.listProduct');
  if (!listProductHTML) return;

  listProductHTML.innerHTML = "";
  const pageItems = getPaginationProduct(page);

  if (pageItems.length === 0) {
    listProductHTML.innerHTML = "<p>No product available.</p>";
    return;
  }

  pageItems.forEach(product => {
    let newProduct = document.createElement('div');
    newProduct.classList.add('item');
    newProduct.innerHTML = `
      <a href="/detail.html?id=${product.id}">
        <img src="${product.image}">
      </a>
      <h2>${product.name}</h2>
      <div class="price">$${product.price}</div>
      <button class="addCart" data-id="${product.id}">
        Add To Cart
      </button>
    `;
    listProductHTML.appendChild(newProduct);
  });
}

// Pagination with Next & Previous buttons
function setupPagination() {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  pagination.innerHTML = "";
  const totalPages = Math.ceil(filteredProducts.length / productPerPage);

  // Prev Button
  const prevBtn = document.createElement("button");
  prevBtn.innerText = "Prev";
  prevBtn.disabled = livePage === 1;
  if (livePage === 1) prevBtn.classList.add("disabled");
  else prevBtn.classList.add("prev");
  prevBtn.addEventListener("click", () => {
    if (livePage > 1) {
      livePage--;
      renderPage(livePage);
      setupPagination();
    }
  });
  pagination.appendChild(prevBtn);

  // --- Show only 3 pages at a time ---
  let startPage = Math.max(1, livePage - 1);
  let endPage = Math.min(totalPages, startPage + 2);

  if (endPage - startPage < 2) {
    startPage = Math.max(1, endPage - 2);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    if (i === livePage) btn.classList.add("active");

    btn.addEventListener("click", () => {
      livePage = i;
      renderPage(livePage);
      setupPagination();
    });

    pagination.appendChild(btn);
  }

  // Next Button
  const nextBtn = document.createElement("button");
  nextBtn.innerText = "Next";
  nextBtn.disabled = livePage === totalPages;
  nextBtn.classList.add("next");
  if (livePage === totalPages) nextBtn.classList.add("disabled");
  else nextBtn.classList.add("next");
  nextBtn.addEventListener("click", () => {
    if (livePage < totalPages) {
      livePage++;
      renderPage(livePage);
      setupPagination();
    }
  });
  pagination.appendChild(nextBtn);
}


// Filter applies here
function applyFilters() {
  filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery);

    let matchesPrice = true;
    if (selectedPriceRange) {
      const [min, max] = selectedPriceRange.split("-").map(Number);
      matchesPrice = p.price >= min && p.price <= max;
    }

    return matchesSearch && matchesPrice;
  });

  livePage = 1;
  renderPage(livePage);
  setupPagination();
}

function setupControls() {
  const searchInput = document.getElementById("searchInput");
  const priceSelect = document.getElementById("filter-price");
  const paginationLimitSelect = document.getElementById("pagination-limit");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase();
      applyFilters();
    });
  }

  if (priceSelect) {
    priceSelect.addEventListener("change", (e) => {
      selectedPriceRange = e.target.value;
      applyFilters();
    });
  }

  if (paginationLimitSelect) {
    paginationLimitSelect.addEventListener("change", (e) => {
      productPerPage = parseInt(e.target.value, 10);
      livePage = 1;
      applyFilters();
    });
  }
}

// Template loads again
const loadTemplate = () => {
  fetch('template.html')
    .then(response => response.text())
    .then(html => {
      app.innerHTML = html;
      let contentTab = document.getElementById('contentTab');
      contentTab.innerHTML = temporaryContent.innerHTML;
      temporaryContent.innerHTML = '';

      cart();
      setupControls();
      applyFilters();
    })
    .catch(err => console.error('Error loading :', err));
};

loadTemplate();
