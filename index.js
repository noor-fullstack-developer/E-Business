import products from './products.js';
import cart from './cart.js';

let app = document.getElementById('app');
let temporaryContent = document.getElementById('temporaryContent');

const productPerPage = 3;
let livePage = 1;
let filteredProducts = [...products];
let searchQuery = "";
let selectedPriceRange = "";

// this is all Pagination + filter + search
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
    listProductHTML.innerHTML = "<p>No product avialable.</p>";
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

function setupPagination() {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  pagination.innerHTML = "";
  const totalPages = Math.ceil(filteredProducts.length / productPerPage);

  for (let i = 1; i <= totalPages; i++) {
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
}

// filter Applyes here 
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
}

//tamplate loads again
const loadTemplate = () => {
  fetch('/template.html')
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
    .catch(err => console.error('Error loading template:', err));
};

loadTemplate();
