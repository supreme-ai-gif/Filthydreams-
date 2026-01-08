import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const tabsNav = document.getElementById("tabsNav");
const productsEl = document.getElementById("productsContainer");
const searchBar = document.getElementById("searchBar");

let currentTab = "all";
let products = [];

/* LOGOUT */
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  location.href = "../index.html";
};

document.getElementById("cartBtn").onclick = () => location.href = "./cart.html";
document.getElementById("profileBtn").onclick = () => location.href = "./profile.html";

/* LOAD TABS */
async function loadTabs() {
  const { data } = await supabase.from("tabs").select("*");

  tabsNav.innerHTML = "";
  addTab("All", "all");

  data.forEach(t => addTab(t.name, t.id));
}

function addTab(name, id) {
  const btn = document.createElement("button");
  btn.textContent = name;
  if (currentTab === id) btn.classList.add("active");

  btn.onclick = () => {
    currentTab = id;
    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts();
  };

  tabsNav.appendChild(btn);
}

/* LOAD PRODUCTS */
async function loadProducts() {
  const { data } = await supabase.from("products").select("*");
  products = data;
  renderProducts();
}

function renderProducts() {
  productsEl.innerHTML = "";
  const q = searchBar.value.toLowerCase();

  products
    .filter(p =>
      (currentTab === "all" || p.tab_id === currentTab) &&
      p.name.toLowerCase().includes(q)
    )
    .forEach(p => {
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
        location.href = "./product.html?id=" + p.id;
      };
      productsEl.appendChild(div);
    });
}

searchBar.addEventListener("input", renderProducts);

loadTabs();
loadProducts();
