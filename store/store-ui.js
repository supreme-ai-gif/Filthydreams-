import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

document.addEventListener("DOMContentLoaded", async () => {

  // ----------------------------
  // SUPABASE
  // ----------------------------
  const supabase = createClient(
    window.__ENV__.SUPABASE_URL,
    window.__ENV__.SUPABASE_ANON_KEY
  );

  // ----------------------------
  // ELEMENTS (MATCH YOUR HTML)
  // ----------------------------
  const tabsNav = document.getElementById("tabsNav");
  const productsContainer = document.getElementById("productsContainer");
  const searchBar = document.getElementById("searchBar");

  const profileBtn = document.getElementById("profileBtn");
  const cartBtn = document.getElementById("cartBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // ----------------------------
  // STATE
  // ----------------------------
  let allProducts = [];
  let currentTab = "all";
  let allTabs = [];

  // ----------------------------
  // SIDEBAR TEMPLATE ROUTING
  // ----------------------------
  profileBtn.onclick = () => location.href = "./profile.html";
  cartBtn.onclick = () => location.href = "./cart.html";
  logoutBtn.onclick = () => {
    localStorage.clear();
    location.href = "../index.html";
  };

  // ----------------------------
  // LOAD TABS
  // ----------------------------
  async function loadTabs() {
    const { data, error } = await supabase
      .from("tabs")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Tabs error:", error);
      return;
    }

    allTabs = data || [];
    renderTabs();
  }

  function renderTabs() {
    tabsNav.innerHTML = "";

    // ALL TAB
    createTabButton("All", "all");

    // ADMIN TABS
    allTabs.forEach(tab => {
      createTabButton(tab.name, tab.id);
    });
  }

  function createTabButton(name, id) {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.className = id === currentTab ? "active" : "";

    btn.onclick = () => {
      currentTab = id;
      updateActiveTabs();
      renderProducts();
    };

    tabsNav.appendChild(btn);
  }

  function updateActiveTabs() {
    [...tabsNav.children].forEach(btn => {
      btn.classList.remove("active");
      if (
        (btn.textContent === "All" && currentTab === "all") ||
        btn.textContent === getTabNameById(currentTab)
      ) {
        btn.classList.add("active");
      }
    });
  }

  function getTabNameById(id) {
    if (id === "all") return "All";
    const tab = allTabs.find(t => t.id === id);
    return tab ? tab.name : "";
  }

  // ----------------------------
  // LOAD PRODUCTS (ONCE)
  // ----------------------------
  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Products error:", error);
      return;
    }

    allProducts = data || [];
    renderProducts();
  }

  // ----------------------------
  // RENDER PRODUCTS
  // ----------------------------
  function renderProducts() {
    productsContainer.innerHTML = "";

    let filtered = [...allProducts];

    // FILTER BY TAB
    if (currentTab !== "all") {
      filtered = filtered.filter(p => p.tab_id === currentTab);
    }

    // SEARCH FILTER
    const q = searchBar.value.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) return;

    filtered.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <img src="${p.image_url}" alt="${p.name}">
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

  // ----------------------------
  // SEARCH LISTENER
  // ----------------------------
  searchBar.addEventListener("input", () => {
    renderProducts();
  });

  // ----------------------------
  // INIT
  // ----------------------------
  await loadTabs();
  await loadProducts();

});
