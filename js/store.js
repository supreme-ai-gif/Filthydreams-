import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const tabsDiv = document.getElementById("tabs");
const productsDiv = document.getElementById("products");
const searchInput = document.getElementById("searchInput");
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");

let currentTab = "all";
let allProducts = [];

/* MOBILE MENU */
menuBtn.onclick = () => sidebar.classList.toggle("show");

/* LOAD TABS */
async function loadTabs() {
  tabsDiv.innerHTML = "";
  createTab("All", "all");

  const { data } = await supabase.from("tabs").select("*");
  data.forEach(t => createTab(t.name, t.id));
}

function createTab(name, id) {
  const div = document.createElement("div");
  div.className = "tab";
  div.textContent = name;
  if (currentTab === id) div.classList.add("active");

  div.onclick = () => {
    currentTab = id;
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    div.classList.add("active");
    renderProducts();
    sidebar.classList.remove("show");
  };

  tabsDiv.appendChild(div);
}

/* LOAD PRODUCTS */
async function loadProducts() {
  const { data } = await supabase.from("products").select("*");
  allProducts = data;
  renderProducts();
}

function renderProducts() {
  productsDiv.innerHTML = "";

  let filtered = allProducts.filter(p =>
    currentTab === "all" ? true : p.tab_id === currentTab
  );

  const search = searchInput.value.toLowerCase();
  if (search) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search)
    );
  }

  if (filtered.length === 0) {
    productsDiv.innerHTML = "<p>No products found</p>";
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product";
    card.innerHTML = `
      <img src="${p.image_url}">
      <div class="info">
        <h4>${p.name}</h4>
        <span>$${p.price}</span>
        <button onclick="window.open('${p.buy_link}', '_blank')">Buy</button>
      </div>
    `;
    productsDiv.appendChild(card);
  });
}

searchInput.oninput = renderProducts;

/* INIT */
loadTabs();
loadProducts();
