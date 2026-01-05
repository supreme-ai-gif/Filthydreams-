import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = window.__ENV__.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV__.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const tabsContainer = document.getElementById("tabs");
const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");

let currentTab = "all";
let tabsList = [];

menuBtn.addEventListener("click", () => sidebar.classList.toggle("show"));

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  location.href = "./login.html";
});

// Load profile info
async function loadProfile() {
  const profile = JSON.parse(localStorage.getItem("userProfile"));
  if (!profile) return;
  document.getElementById("profileName").textContent = profile.name;
  document.getElementById("profileEmail").textContent = profile.email;
  document.getElementById("profileAvatar").src = profile.avatar || "./default-avatar.png";
}

// Load tabs from Supabase
async function loadTabs() {
  const { data, error } = await supabase.from("tabs").select("*");
  if (error) return console.error(error);

  tabsList = data || [];
  tabsContainer.innerHTML = "";
  renderTab("All", "all");
  tabsList.forEach(t => renderTab(t.name, t.id));
}

// Render individual tab
function renderTab(name, id) {
  const btn = document.createElement("button");
  btn.className = "tab";
  btn.textContent = name;
  if (currentTab === id) btn.classList.add("active");

  btn.addEventListener("click", () => {
    currentTab = id;
    highlightTabs();
    loadProducts();
  });

  tabsContainer.appendChild(btn);
}

function highlightTabs() {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  [...tabsContainer.children].find(b => {
    return (currentTab === "all" && b.textContent === "All") || b.textContent === tabsList.find(tab=>tab.id===currentTab)?.name
  })?.classList.add("active");
}

// Load products
async function loadProducts() {
  let query = supabase.from("products").select("*");
  if (currentTab !== "all") query = query.eq("tab_id", currentTab);

  if (searchInput.value.trim()) {
    query = query.ilike("name", `%${searchInput.value.trim()}%`);
  }

  const { data, error } = await query;
  if (error) return console.error(error);

  productsGrid.innerHTML = "";
  if (!data || data.length === 0) {
    productsGrid.innerHTML = "<p class='muted'>No products found</p>";
    return;
  }

  data.forEach(p => {
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
    productsGrid.appendChild(card);
  });
}

// Search bar
searchInput.addEventListener("input", loadProducts);

// INITIALIZE
loadProfile();
loadTabs();
loadProducts();
