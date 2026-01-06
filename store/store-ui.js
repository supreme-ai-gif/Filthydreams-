import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = window.__ENV__.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV__.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM
const sideMenu = document.getElementById("sideMenu");
const menuIcon = document.getElementById("menuIcon");
const logoutBtn = document.getElementById("logoutBtn");
const avatarEl = document.getElementById("avatar");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const productsContainer = document.getElementById("productsContainer");
const tabsNav = document.getElementById("tabsNav");
const searchBar = document.getElementById("searchBar");

// Load profile
const user = JSON.parse(localStorage.getItem("userProfile") || "{}");
avatarEl.style.backgroundImage = user.avatar ? `url(${user.avatar})` : '';
profileName.textContent = user.name || "User";
profileEmail.textContent = user.email || "";

// Menu toggle
menuIcon.addEventListener("click", () => sideMenu.classList.toggle("active"));
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  location.href="../index.html";
});

// --- LOAD TABS ---
let currentTab = "all";
async function loadTabs() {
  const { data: tabs } = await supabase.from("tabs").select("*");
  tabsNav.innerHTML = "";
  renderTab("All", "all");
  tabs.forEach(t => renderTab(t.name, t.id));
}

function renderTab(name, id) {
  const btn = document.createElement("button");
  btn.textContent = name;
  if (currentTab === id) btn.classList.add("active");

  btn.addEventListener("click", () => {
    currentTab = id;
    highlightTabs();
    loadProducts();
  });

  tabsNav.appendChild(btn);
}

function highlightTabs() {
  document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
  [...tabsNav.children].find(b => b.textContent === (currentTab==="all"?"All":b.textContent))?.classList.add("active");
}

// --- LOAD PRODUCTS ---
async function loadProducts() {
  let query = supabase.from("products").select("*");
  if (currentTab !== "all") query = query.eq("tab_id", currentTab);

  const { data: products } = await query;

  const search = searchBar.value.toLowerCase();

  productsContainer.innerHTML = "";
  if (!products || products.length === 0) {
    productsContainer.innerHTML = `<p class="muted">No products found</p>`;
    return;
  }

  products.filter(p => p.name.toLowerCase().includes(search))
    .forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${p.image_url}" alt="${p.name}">
        <div class="info">
          <h4>${p.name}</h4>
          <span>$${p.price}</span>
          <small>👀 ${p.views}</small>
        </div>
      `;
      card.addEventListener("click", () => window.open(p.buy_link, "_blank"));
      productsContainer.appendChild(card);
    });
}

// --- SEARCH BAR ---
searchBar.addEventListener("input", loadProducts);

// INITIAL LOAD
loadTabs();
loadProducts();
