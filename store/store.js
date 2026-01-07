import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = window.__ENV__.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV__.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tabsNav = document.getElementById("tabsNav");
const productsContainer = document.getElementById("productsContainer");
const searchBar = document.getElementById("searchBar");

let currentTab = "all";
let allProducts = [];

/* ---------------- LOGOUT ---------------- */
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  location.href = "../login.html";
};

/* ---------------- LOAD TABS ---------------- */
async function loadTabs() {
  const { data, error } = await supabase.from("tabs").select("*");
  if (error) return console.error(error);

  tabsNav.innerHTML = "";

  createTabButton("All", "all");

  data.forEach(tab => {
    createTabButton(tab.name, tab.id);
  });
}

function createTabButton(name, id) {
  const btn = document.createElement("button");
  btn.textContent = name;
  btn.className = id === currentTab ? "active" : "";

  btn.onclick = () => {
    currentTab = id;
    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts();
  };

  tabsNav.appendChild(btn);
}

/* ---------------- LOAD PRODUCTS ---------------- */
async function loadProducts() {
  const { data, error } = await supabase.from("products").select("*");
  if (error) return console.error(error);

  allProducts = data;
  renderProducts();
}

function renderProducts() {
  productsContainer.innerHTML = "";

  const search = searchBar.value.toLowerCase();

  const filtered = allProducts.filter(p => {
    const matchesTab = currentTab === "all" || p.tab_id === currentTab;
    const matchesSearch = p.name.toLowerCase().includes(search);
    return matchesTab && matchesSearch;
  });

  if (filtered.length === 0) {
    productsContainer.innerHTML = "<p>No products found</p>";
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.image_url}">
      <div class="info">
        <h4>${p.name}</h4>
        <span>$${p.price}</span>
      </div>
    `;

    // ✅ THIS IS THE IMPORTANT PART
    card.addEventListener("click", () => {
      window.location.href = "./product.html?id=" + p.id;
    });

    productsContainer.appendChild(card);
  });
}

/* ---------------- SEARCH ---------------- */
searchBar.addEventListener("input", renderProducts);

/* ---------------- HEADER ICONS ---------------- */
document.getElementById("cartIcon").onclick = () => {
  location.href = "./cart.html";
};

document.getElementById("profileIcon").onclick = () => {
  location.href = "./profile.html";
};

/* ---------------- INIT ---------------- */
loadTabs();
loadProducts();
