import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

document.addEventListener("DOMContentLoaded", async () => {

  const supabase = createClient(
    window.__ENV__.SUPABASE_URL,
    window.__ENV__.SUPABASE_ANON_KEY
  );

  // -------------------------
  // ELEMENTS
  // -------------------------
  const tabsNav = document.getElementById("tabsNav");
  const productsContainer = document.getElementById("productsContainer");
  const searchBar = document.getElementById("searchBar");

  // TOP RIGHT ICONS (YOU ADD ICONS IN HTML)
  const cartIcon = document.getElementById("cartIcon");
  const profileIcon = document.getElementById("profileIcon");
  const logoutBtn = document.getElementById("logoutBtn");

  // -------------------------
  // ROUTING
  // -------------------------
  if (cartIcon) cartIcon.onclick = () => location.href = "./cart.html";
  if (profileIcon) profileIcon.onclick = () => location.href = "./profile.html";
  if (logoutBtn) logoutBtn.onclick = () => location.href = "../login.html";

  // -------------------------
  // STATE
  // -------------------------
  let allProducts = [];
  let allTabs = [];
  let currentTab = "all";

  // -------------------------
  // LOAD TABS
  // -------------------------
  async function loadTabs() {
    const { data, error } = await supabase
      .from("tabs")
      .select("*")
      .order("created_at");

    if (error) {
      console.error(error);
      return;
    }

    allTabs = data || [];
    renderTabs();
  }

  function renderTabs() {
    tabsNav.innerHTML = "";
    createTab("All", "all");

    allTabs.forEach(tab => {
      createTab(tab.name, tab.id);
    });
  }

  function createTab(name, id) {
    const btn = document.createElement("button");
    btn.textContent = name;
    if (id === currentTab) btn.classList.add("active");

    btn.onclick = () => {
      currentTab = id;
      updateTabs();
      renderProducts();
    };

    tabsNav.appendChild(btn);
  }

  function updateTabs() {
    [...tabsNav.children].forEach(btn => {
      btn.classList.remove("active");
      if (
        (btn.textContent === "All" && currentTab === "all") ||
        btn.textContent === getTabName(currentTab)
      ) {
        btn.classList.add("active");
      }
    });
  }

  function getTabName(id) {
    if (id === "all") return "All";
    const t = allTabs.find(t => t.id === id);
    return t ? t.name : "";
  }

  // -------------------------
  // LOAD PRODUCTS
  // -------------------------
  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    allProducts = data || [];
    renderProducts();
  }

  // -------------------------
  // RENDER PRODUCTS
  // -------------------------
  function renderProducts() {
    productsContainer.innerHTML = "";

    let filtered = [...allProducts];

    if (currentTab !== "all") {
      filtered = filtered.filter(p => p.tab_id === currentTab);
    }

    const q = searchBar.value.toLowerCase();
    if (q) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q)
      );
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

      card.onclick = () => {
        location.href = `product.html?id=${p.id}`;
      };

      productsContainer.appendChild(card);
    });
  }

  // -------------------------
  // SEARCH
  // -------------------------
  searchBar.addEventListener("input", renderProducts);

  // -------------------------
  // INIT
  // -------------------------
  await loadTabs();
  await loadProducts();

});
