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
  const productsContainer = document.getElementById("productsContainer");
  const searchBar = document.getElementById("searchBar");

  // sidebar buttons (template routing)
  const profileBtn = document.getElementById("profileBtn");
  const cartBtn = document.getElementById("cartBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // ----------------------------
  // SIDEBAR TEMPLATE NAVIGATION
  // ----------------------------
  profileBtn.onclick = () => {
    window.location.href = "./profile.html";
  };

  cartBtn.onclick = () => {
    window.location.href = "./cart.html";
  };

  logoutBtn.onclick = () => {
    localStorage.clear();
    window.location.href = "../index.html";
  };

  // ----------------------------
  // LOAD PRODUCTS (NO TABS YET)
  // ----------------------------
  async function loadProducts() {
    productsContainer.innerHTML = "";

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      productsContainer.innerHTML = "<p>Error loading products</p>";
      return;
    }

    if (!data || data.length === 0) {
      productsContainer.innerHTML = "<p>No products found</p>";
      return;
    }

    renderProducts(data);
  }

  // ----------------------------
  // RENDER PRODUCTS
  // ----------------------------
  function renderProducts(products) {
    productsContainer.innerHTML = "";

    products.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <img src="${p.image_url}" alt="${p.name}">
        <div class="info">
          <h4>${p.name}</h4>
          <span>$${p.price}</span>
        </div>
      `;

      // product page navigation
      card.onclick = () => {
        window.location.href = `product.html?id=${p.id}`;
      };

      productsContainer.appendChild(card);
    });
  }

  // ----------------------------
  // SEARCH (CLIENT SIDE)
  // ----------------------------
  searchBar.addEventListener("input", async (e) => {
    const q = e.target.value.toLowerCase();

    const { data } = await supabase.from("products").select("*");

    const filtered = data.filter(p =>
      p.name.toLowerCase().includes(q)
    );

    renderProducts(filtered);
  });

  // ----------------------------
  // INIT
  // ----------------------------
  await loadProducts();

});
