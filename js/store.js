import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = window.__ENV__.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV__.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tabsEl = document.getElementById("tabs");
const productsEl = document.getElementById("products");
const searchInput = document.getElementById("searchInput");
const menuBtn = document.getElementById("menuBtn");
const sideMenu = document.getElementById("sideMenu");
const authButtons = document.getElementById("authButtons");

let currentTab = "all";
let allProducts = [];

/* SIDE MENU TOGGLE */
menuBtn.onclick = () => sideMenu.classList.toggle("open");

/* AUTH BUTTONS */
function renderAuthButtons() {
  const user = localStorage.getItem("user");

  if (user) {
    authButtons.innerHTML = `
      <button id="profileBtn">Profile</button>
      <button id="logoutBtn">Logout</button>
    `;

    document.getElementById("logoutBtn").onclick = () => {
      localStorage.clear();
      location.reload();
    };

    document.getElementById("profileBtn").onclick = () => {
      location.href = "profile.html";
    };

  } else {
    authButtons.innerHTML = `
      <button id="loginBtn">Login</button>
      <button id="registerBtn">Register</button>
    `;

    document.getElementById("loginBtn").onclick = () => location.href="login.html";
    document.getElementById("registerBtn").onclick = () => location.href="register.html";
  }
}

/* LOAD TABS */
async function loadTabs() {
  const { data: tabs } = await supabase.from("tabs").select("*").order("id");
  tabsEl.innerHTML = "";
  createTab("All", "all");
  tabs.forEach(tab => createTab(tab.name, tab.id));
}

function createTab(name, id) {
  const el = document.createElement("div");
  el.className = "tab";
  el.textContent = name;
  if (currentTab === id) el.classList.add("active");

  el.onclick = () => {
    currentTab = id;
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    el.classList.add("active");
    renderProducts();
  };

  tabsEl.appendChild(el);
}

/* LOAD PRODUCTS */
async function loadProducts() {
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  allProducts = data || [];
  renderProducts();
}

/* RENDER PRODUCTS */
function renderProducts() {
  const search = searchInput.value.toLowerCase();
  productsEl.innerHTML = "";

  const filtered = allProducts.filter(p => {
    const matchesTab = currentTab === "all" || p.tab_id === currentTab;
    const matchesSearch = p.name.toLowerCase().includes(search);
    return matchesTab && matchesSearch;
  });

  if (filtered.length === 0) {
    productsEl.innerHTML = `<p style="opacity:.6; text-align:center;">No products found</p>`;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product";
    card.innerHTML = `
      <img src="${p.image_url}">
      <div class="info">
        <h3>${p.name}</h3>
        <div class="price">$${p.price}</div>
        <small>👀 ${p.views}</small>
        <a href="${p.buy_link}" target="_blank">Buy</a>
      </div>
    `;

    card.onclick = () => incrementViews(p.id);
    productsEl.appendChild(card);
  });
}

/* VIEW COUNTER */
async function incrementViews(id) {
  await supabase.rpc("increment_views", { product_id: id });
}

/* SEARCH INPUT */
searchInput.oninput = renderProducts;

/* INIT */
renderAuthButtons();
loadTabs();
loadProducts();
