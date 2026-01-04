import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

document.addEventListener("DOMContentLoaded", () => {

  const supabase = createClient(
    window.__ENV__.SUPABASE_URL,
    window.__ENV__.SUPABASE_ANON_KEY
  );

  if (localStorage.getItem("isAdmin") !== "true") {
    location.href = "../login.html";
    return;
  }

  const adminTabs = document.getElementById("adminTabs");
  const adminProducts = document.getElementById("adminProducts");
  const panel = document.getElementById("adminPanel");

  const createTabBtn = document.getElementById("createTabBtn");
  const postProductBtn = document.getElementById("postProductBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  let currentTabId = null;

  logoutBtn.onclick = () => {
    localStorage.clear();
    location.href = "../login.html";
  };

  /* ================= TABS ================= */

  async function loadTabs() {
    const { data: tabs } = await supabase.from("tabs").select("*");

    adminTabs.innerHTML = "";

    createTabButton("All", null);

    tabs.forEach(tab => createTabButton(tab.name, tab.id));
  }

  function createTabButton(name, id) {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.textContent = name;

    if (currentTabId === id) btn.classList.add("active");

    btn.onclick = () => {
      currentTabId = id;
      highlightTabs();
      loadProducts();
    };

    if (id !== null) {
      let timer;
      btn.onmousedown = () =>
        timer = setTimeout(() => deleteTab(id, name), 700);
      btn.onmouseup = () => clearTimeout(timer);
    }

    adminTabs.appendChild(btn);
  }

  function highlightTabs() {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    [...adminTabs.children].find(
      b => (currentTabId === null ? b.textContent === "All" : true)
    )?.classList.add("active");
  }

  async function deleteTab(id, name) {
    if (!confirm(`Delete "${name}" and all its products?`)) return;
    await supabase.from("products").delete().eq("tab_id", id);
    await supabase.from("tabs").delete().eq("id", id);
    currentTabId = null;
    loadTabs();
    loadProducts();
  }

  /* ================= PRODUCTS ================= */

  async function loadProducts() {
    let q = supabase.from("products").select("*");
    if (currentTabId !== null) q = q.eq("tab_id", currentTabId);

    const { data } = await q;
    adminProducts.innerHTML = "";

    data.forEach(p => {
      const card = document.createElement("div");
      card.className = "admin-product";
      card.innerHTML = `
        <img src="${p.image_url}">
        <div>
          <strong>${p.name}</strong>
          <small>$${p.price}</small>
          <small>👀 ${p.views}</small>
        </div>
      `;

      let t;
      card.onmousedown = () => t = setTimeout(() => openEditProduct(p), 700);
      card.onmouseup = () => clearTimeout(t);

      adminProducts.appendChild(card);
    });
  }

  /* ================= CREATE TAB ================= */

  createTabBtn.onclick = () => {
    panel.innerHTML = `
      <h3>Create Tab</h3>
      <input id="tabName" placeholder="Tab name">
      <button id="saveTab">Create</button>
    `;

    saveTab.onclick = async () => {
      if (!tabName.value.trim()) return alert("Enter tab name");
      await supabase.from("tabs").insert({ name: tabName.value });
      alert("Tab created");
      panel.innerHTML = `<p class="placeholder">Select an action</p>`;
      loadTabs();
    };
  };

  /* ================= POST PRODUCT ================= */

  postProductBtn.onclick = async () => {
    const { data: tabs } = await supabase.from("tabs").select("*");

    panel.innerHTML = `
      <h3>Post Product</h3>
      <input type="file" id="img" accept="image/*">
      <input id="name" placeholder="Product name">
      <textarea id="desc" placeholder="Description"></textarea>
      <input id="price" type="number" placeholder="Price">
      <input id="link" placeholder="Buy link">

      <select id="tab">
        <option value="">All</option>
        ${tabs.map(t => `<option value="${t.id}">${t.name}</option>`).join("")}
      </select>

      <button id="post">Post Product</button>
    `;

    post.onclick = postProduct;
  };

  async function postProduct() {
    const file = img.files[0];
    if (!file) return alert("Select an image");

    const path = `products/${Date.now()}-${file.name}`;
    await supabase.storage.from("products").upload(path, file);

    const { publicURL } =
      supabase.storage.from("products").getPublicUrl(path);

    await supabase.from("products").insert({
      name: name.value,
      description: desc.value,
      price: price.value,
      buy_link: link.value,
      image_url: publicURL,
      tab_id: tab.value || null,
      views: 0
    });

    alert("Product created successfully");
    panel.innerHTML = `<p class="placeholder">Select an action</p>`;
    loadProducts();
  }

  /* ================= EDIT PRODUCT ================= */

  function openEditProduct(p) {
    panel.innerHTML = `
      <h3>Edit Product</h3>
      <input id="name" value="${p.name}">
      <textarea id="desc">${p.description}</textarea>
      <input id="price" type="number" value="${p.price}">
      <input id="link" value="${p.buy_link}">
      <button id="save">Save</button>
      <button id="del" style="background:red">Delete</button>
    `;

    save.onclick = async () => {
      await supabase.from("products").update({
        name: name.value,
        description: desc.value,
        price: price.value,
        buy_link: link.value
      }).eq("id", p.id);

      alert("Updated");
      loadProducts();
    };

    del.onclick = async () => {
      if (!confirm("Delete product?")) return;
      await supabase.from("products").delete().eq("id", p.id);
      loadProducts();
    };
  }

  /* ================= SETTINGS ================= */

  settingsBtn.onclick = () => {
    panel.innerHTML = `
      <h3>Admin Account</h3>
      <p>Username & password change coming next.</p>
    `;
  };

  /* ================= INIT ================= */
  loadTabs();
  loadProducts();

});
