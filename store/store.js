import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "YOUR_SUPABASE_URL",
  "YOUR_SUPABASE_ANON_KEY"
);

const tabsEl = document.getElementById("tabs");
const productsEl = document.getElementById("products");
const searchInput = document.getElementById("searchInput");
const logoutBtn = document.getElementById("logoutBtn");

let currentTab = "all";
let allProducts = [];

/* LOGOUT */
logoutBtn.onclick = () => {
  localStorage.clear();
  location.href = "../login.html";
};

/* LOAD TABS */
async function loadTabs() {
  const { data } = await supabase.from("tabs").select("*");
  tabsEl.innerHTML = "";

  createTab("All", "all");

  data.forEach(t => createTab(t.name, t.id));
}

/* CREATE TAB BUTTON */
function createTab(name, id) {
  const btn = document.createElement("button");
  btn.textContent = name;
  if (currentTab === id) btn.classList.add("active");

  btn.onclick = () => {
    currentTab = id;
    document.querySelectorAll(".tabs button")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts();
  };

  tabsEl.appendChild(btn);
}

/* LOAD PRODUCTS */
async function loadProducts() {
  const { data } = await supabase.from("products").select("*");
  allProducts = data || [];
  renderProducts();
}

/* RENDER PRODUCTS */
function renderProducts() {
  productsEl.innerHTML = "";

  const filtered = allProducts.filter(p => {
    if (currentTab !== "all" && p.tab_id !== currentTab) return false;
    if (searchInput.value &&
        !p.name.toLowerCase().includes(searchInput.value.toLowerCase()))
      return false;
    return true;
  });

  if (!filtered.length) {
    productsEl.innerHTML = "<p>No products found</p>";
    return;
  }

  filtered.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${p.image_url}">
      <div class="info">
        <h4>${p.name}</h4>
        <span>$${p.price}</span>
      </div>
    `;
    div.onclick = () => {
      location.href = `product.html?id=${p.id}`;
    };
    productsEl.appendChild(div);
  });
}

searchInput.oninput = renderProducts;

loadTabs();
loadProducts();
