import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

// 🔹 SIDE MENU TOGGLE
const menuBtn = document.getElementById("menuBtn");
const closeMenu = document.getElementById("closeMenu");
const sideMenu = document.getElementById("sideMenu");

menuBtn.onclick = () => sideMenu.classList.add("show");
closeMenu.onclick = () => sideMenu.classList.remove("show");

// 🔹 LOAD TABS
async function loadTabs() {
  const { data: tabs, error } = await supabase.from("tabs").select("*");
  const tabsContainer = document.querySelector(".tabs");
  tabsContainer.innerHTML = `<button class="tab active" data-id="">All</button>`;

  if (tabs) {
    tabs.forEach(tab => {
      const btn = document.createElement("button");
      btn.classList.add("tab");
      btn.textContent = tab.name;
      btn.dataset.id = tab.id;
      btn.onclick = () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        btn.classList.add("active");
        loadProducts(tab.id);
      };
      tabsContainer.appendChild(btn);
    });
  }
}

// 🔹 LOAD PRODUCTS
async function loadProducts(tabId = null) {
  let query = supabase.from("products").select("*");
  if (tabId) query = query.eq("tab_id", tabId);

  const { data: products, error } = await query;
  const productsContainer = document.querySelector(".products");
  productsContainer.innerHTML = "";

  if (!products || products.length === 0) {
    productsContainer.innerHTML = `<p style="text-align:center;color:#888">No products yet.</p>`;
    return;
  }

  products.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <img src="${p.image_url}" alt="${p.name}" />
      <div class="info">
        <span class="name">${p.name}</span>
        <span class="price">$${p.price}</span>
      </div>
    `;
    card.onclick = () => window.location.href = `../product.html?id=${p.id}`;
    productsContainer.appendChild(card);
  });
}

// 🔹 INIT
loadTabs();
loadProducts();
