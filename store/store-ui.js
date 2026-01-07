import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

document.addEventListener("DOMContentLoaded", async () => {

  // SUPABASE
  const supabase = createClient(
    window.__ENV__.SUPABASE_URL,
    window.__ENV__.SUPABASE_ANON_KEY
  );

  // ELEMENTS
  const tabsContainer = document.getElementById("tabs");
  const productsContainer = document.getElementById("products");
  const searchInput = document.getElementById("searchInput");

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
      console.error("Tabs error:", error);
      return;
    }

    tabsContainer.innerHTML = "";

    // ALL TAB
    createTab("All", "all");

    // ADMIN TABS
    tabs.forEach(tab => {
      createTab(tab.name, tab.id);
    });
  }

  function createTab(name, id) {
    const btn = document.createElement("button");
    btn.className = "tab-btn";
    btn.textContent = name;
    if (currentTab === id) btn.classList.add("active");

    btn.addEventListener("click", () => {
      currentTab = id;
      updateActiveTab();
      renderProducts();
    });

    tabsContainer.appendChild(btn);
  }

  function updateActiveTab() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.classList.remove("active");
      if (
        (btn.textContent === "All" && currentTab === "all") ||
        btn.dataset?.id === currentTab
      ) {
        btn.classList.add("active");
      }
    });
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

    // SEARCH
    const query = searchInput?.value?.toLowerCase();
    if (query) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query)
      );
    }

    if (filtered.length === 0) {
      productsContainer.innerHTML = `<p class="muted">No products found</p>`;
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <img src="${p.image_url}" alt="${p.name}">
        <div class="product-info">
          <h4>${p.name}</h4>
          <span class="price">$${p.price}</span>
        </div>
      `;

      // 👉 PRODUCT PAGE NAVIGATION
      card.addEventListener("click", () => {
        window.location.href = `product.html?id=${p.id}`;
      });

      productsContainer.appendChild(card);
    });
  }

  // ----------------------------
  // SEARCH LISTENER
  // ----------------------------
  if (searchInput) {
    searchInput.addEventListener("input", renderProducts);
  }

  // ----------------------------
  // INIT
  // ----------------------------
  await loadTabs();
  await loadProducts();

});
