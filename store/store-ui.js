import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

document.addEventListener("DOMContentLoaded", async () => {

  const supabase = createClient(
    window.__ENV__.SUPABASE_URL,
    window.__ENV__.SUPABASE_ANON_KEY
  );

  // DOM
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.getElementById("menuBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const productsContainer = document.getElementById("productsContainer");
  const tabsNav = document.getElementById("tabsNav");
  const searchBar = document.getElementById("searchBar");

  // ===== SIDEBAR TOGGLE =====
  function openSidebar() {
    sidebar.classList.add("show");
    overlay.classList.add("show");
  }

  function closeSidebar() {
    sidebar.classList.remove("show");
    overlay.classList.remove("show");
  }

  menuBtn.onclick = openSidebar;
  overlay.onclick = closeSidebar;

  logoutBtn.onclick = () => {
    localStorage.clear();
    location.href = "../index.html";
  };

  // ===== LOAD PROFILE =====
  const user = JSON.parse(localStorage.getItem("userProfile") || "{}");
  document.getElementById("profileName").textContent = user.name || "User";
  document.getElementById("profileEmail").textContent = user.email || "";

  // ===== TABS =====
  let currentTab = "all";

  async function loadTabs() {
    const { data: tabs } = await supabase.from("tabs").select("*");
    tabsNav.innerHTML = "";
    renderTab("All", "all");
    tabs?.forEach(t => renderTab(t.name, t.id));
  }

  function renderTab(name, id) {
    const btn = document.createElement("button");
    btn.textContent = name;
    if (currentTab === id) btn.classList.add("active");

    btn.onclick = () => {
      currentTab = id;
      highlightTabs();
      loadProducts();
    };

    tabsNav.appendChild(btn);
  }

  function highlightTabs() {
    [...tabsNav.children].forEach(b => b.classList.remove("active"));
    [...tabsNav.children].find(b => b.textContent === (currentTab === "all" ? "All" : b.textContent))
      ?.classList.add("active");
  }

  // ===== PRODUCTS =====
  async function loadProducts() {
    let query = supabase.from("products").select("*");
    if (currentTab !== "all") query = query.eq("tab_id", currentTab);

    const { data } = await query;
    const search = searchBar.value.toLowerCase();

    productsContainer.innerHTML = "";

    data?.filter(p => p.name.toLowerCase().includes(search))
      products.forEach(p => {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
    <img src="${p.image_url}" alt="${p.name}">
    <div class="product-info">
      <h4>${p.name}</h4>
      <span class="price">$${p.price}</span>
    </div>
  `;

  // ✅ ADD THIS PART (THIS IS THE CONNECTION)
  card.addEventListener("click", () => {
    window.location.href = `product.html?id=${p.id}`;
  });

  storeProducts.appendChild(card);
});
 }

  searchBar.oninput = loadProducts;

  await loadTabs();
  await loadProducts();
});
