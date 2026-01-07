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
  // ELEMENTS (MATCHING YOUR HTML)
  // ----------------------------
  const tabsNav = document.getElementById("tabsNav");
  const productsContainer = document.getElementById("productsContainer");
  const searchBar = document.getElementById("searchBar");

  let currentTab = "all";
  let allProducts = [];

  // ----------------------------
  // LOAD TABS
  // ----------------------------
  async function loadTabs() {
    const { data: tabs, error } = await supabase
      .from("tabs")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load tabs:", error);
      return;
    }

    tabsNav.innerHTML = "";

    // ALL TAB
    renderTab("All", "all");

    // ADMIN CREATED TABS
    tabs.forEach(tab => {
      renderTab(tab.name, tab.id);
    });
  }

  function renderTab(name, id) {
    const btn = document.createElement("button");
    btn.textContent = name;

    if (currentTab === id) btn.classList.add("active");

    btn.addEventListener("click", () => {
      currentTab = id;
      updateActiveTabs();
      renderProducts();
    });

    tabsNav.appendChild(btn);
  }

  function updateActiveTabs() {
    [...tabsNav.children].forEach(btn => btn.classList.remove("active"));

    [...tabsNav.children].forEach(btn => {
      if (
        (btn.textContent === "All" && currentTab === "all") ||
        btn.textContent !== "All" && btn.textContent === getTabName(currentTab)
      ) {
        btn.classList.add("active");
      }
    });
  }

  function getTabName(tabId) {
    const tabBtn = [...tabsNav.children].find(b => b.dataset?.id === tabId);
    return tabBtn ? tabBtn.textContent : "";
  }

  // ----------------------------
  // LOAD PRODUCTS
  // ----------------------------
  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load products:", error);
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

    // SEARCH
    const query = searchBar.value.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query)
      );
    }

    if (filtered.length === 0) {
      return; // empty state handled by CSS
    }

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

      // 👉 GO TO PRODUCT PAGE
      card.addEventListener("click", () => {
        window.location.href = `product.html?id=${p.id}`;
      });

      productsContainer.appendChild(card);
    });
  }

  // ----------------------------
  // SEARCH
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
