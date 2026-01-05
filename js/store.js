import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const tabsEl = document.getElementById("tabs");
const productsEl = document.getElementById("products");
const searchInput = document.getElementById("searchInput");
const menuBtn = document.getElementById("menuBtn");
const sideMenu = document.getElementById("sideMenu");
const logoutBtn = document.getElementById("logoutBtn");

let currentTab = "all";
let products = [];

/* AUTH */
logoutBtn.onclick = () => {
  localStorage.clear();
  location.href = "login.html";
};

/* MENU */
menuBtn.onclick = () => sideMenu.classList.toggle("open");

/* LOAD TABS */
async function loadTabs() {
  const { data } = await supabase.from("tabs").select("*");
  tabsEl.innerHTML = "";
  addTab("All", "all");
  data.forEach(t => addTab(t.name, t.id));
}

function addTab(name, id) {
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

  products = data || [];
  renderProducts();
}

/* RENDER PRODUCTS */
function renderProducts() {
  const q = searchInput.value.toLowerCase();
  productsEl.innerHTML = "";

  const filtered = products.filter(p =>
    (currentTab === "all" || p.tab_id === currentTab) &&
    p.name.toLowerCase().includes(q)
  );

  if (!filtered.length) {
    productsEl.innerHTML = `<p style="opacity:.5">No products</p>`;
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

    card.onclick = () =>
      supabase.from("products")
        .update({ views: p.views + 1 })
        .eq("id", p.id);

    productsEl.appendChild(card);
  });
}

searchInput.oninput = renderProducts;

/* INIT */
loadTabs();
loadProducts();
