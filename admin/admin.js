import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

document.addEventListener("DOMContentLoaded", async () => {

  const SUPABASE_URL = window.__ENV__.SUPABASE_URL;
  const SUPABASE_ANON_KEY = window.__ENV__.SUPABASE_ANON_KEY;

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // check if admin
  if (localStorage.getItem("isAdmin") !== "true") {
    alert("Not authorized");
    location.href = "../login.html";
  }

  const adminTabs = document.getElementById("adminTabs");
  const adminProducts = document.getElementById("adminProducts");
  const panel = document.getElementById("adminPanel");

  let currentTab = "all";

  // --- LOGOUT ---
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    location.href = "../login.html";
  });

  // --- LOAD TABS ---
  async function loadTabs() {
    const { data: tabs, error } = await supabase.from("tabs").select("*");
    if (error) { console.error(error); return; }

    adminTabs.innerHTML = "";
    renderTab("All", "all");
    tabs.forEach(tab => renderTab(tab.name, tab.id));
  }

  function renderTab(name, id) {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.textContent = name;
    if (currentTab === id) btn.classList.add("active");

    btn.addEventListener("click", () => {
      currentTab = id;
      highlightTabs();
      loadProducts();
    });

    // long press to delete (only for non-All tabs)
    if (id !== "all") {
      let timer;
      btn.addEventListener("mousedown", () => timer = setTimeout(() => deleteTab(id, name), 700));
      btn.addEventListener("mouseup", () => clearTimeout(timer));
      btn.addEventListener("mouseleave", () => clearTimeout(timer));
    }

    adminTabs.appendChild(btn);
  }

  function highlightTabs() {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    [...adminTabs.children].find(b => b.textContent === (currentTab==="all"?"All":b.textContent))?.classList.add("active");
  }

  async function deleteTab(id, name) {
    if (!confirm(`Delete "${name}" tab and all its products?`)) return;
    await supabase.from("products").delete().eq("tab_id", id);
    await supabase.from("tabs").delete().eq("id", id);
    currentTab = "all";
    await loadTabs();
    await loadProducts();
  }

  // --- LOAD PRODUCTS ---
  async function loadProducts() {
    let query = supabase.from("products").select("*");
    if (currentTab !== "all") query = query.eq("tab_id", currentTab);

    const { data, error } = await query;
    if (error) { console.error(error); return; }

    adminProducts.innerHTML = "";
    if (!data || data.length === 0) {
      adminProducts.innerHTML = `<p class="muted">No products</p>`;
      return;
    }

    data.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${p.image_url}" alt="${p.name}">
        <div class="info">
          <h4>${p.name}</h4>
          <span>$${p.price}</span>
          <small>👀 ${p.views}</small>
        </div>
      `;

      // long press for edit/delete
      let hold;
      card.addEventListener("mousedown", () => hold = setTimeout(() => editProduct(p), 700));
      card.addEventListener("mouseup", () => clearTimeout(hold));
      card.addEventListener("mouseleave", () => clearTimeout(hold));

      adminProducts.appendChild(card);
    });
  }

  // --- CREATE TAB ---
  document.getElementById("createTabBtn").addEventListener("click", () => {
    panel.innerHTML = `
      <h3>Create Tab</h3>
      <input id="tabName" placeholder="Tab name">
      <button class="btn primary" id="saveTabBtn">Create</button>
    `;
    document.getElementById("saveTabBtn").addEventListener("click", async () => {
      const name = document.getElementById("tabName").value.trim();
      if (!name) return alert("Enter tab name");
      await supabase.from("tabs").insert({ name });
      alert("Tab created");
      panel.innerHTML = `<p class="muted">Select an action</p>`;
      await loadTabs();
    });
  });

  // --- POST PRODUCT ---
  document.getElementById("postProductBtn").addEventListener("click", async () => {
    const { data: tabs } = await supabase.from("tabs").select("*");
    panel.innerHTML = `
      <h3>Post Product</h3>
      <input type="file" id="img">
      <input id="name" placeholder="Product name">
      <textarea id="desc" placeholder="Description"></textarea>
      <input id="price" type="number" placeholder="Price">
      <input id="link" placeholder="Buy link">
      <select id="tab">
        <option value="">All</option>
        ${tabs.map(t => `<option value="${t.id}">${t.name}</option>`).join("")}
      </select>
      <button class="btn primary" id="postBtn">Post</button>
    `;
    document.getElementById("postBtn").addEventListener("click", postProduct);
  });

  async function postProduct() {
    const file = document.getElementById("img").files[0];
    if (!file) return alert("Select image");

    const path = `products/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("products").upload(path, file);
    if (uploadError) { console.error(uploadError); return alert("Upload failed"); }

    const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(path);

    await supabase.from("products").insert({
      name: document.getElementById("name").value,
      description: document.getElementById("desc").value,
      price: document.getElementById("price").value,
      buy_link: document.getElementById("link").value,
      image_url: publicUrl,
      tab_id: document.getElementById("tab").value || null,
      views: 0
    });

    alert("Product posted!");
    panel.innerHTML = `<p class="muted">Select an action</p>`;
    await loadProducts();
  }

  // --- EDIT PRODUCT ---
  function editProduct(p) {
    panel.innerHTML = `
      <h3>Edit Product</h3>
      <input id="name" value="${p.name}">
      <textarea id="desc">${p.description}</textarea>
      <input id="price" type="number" value="${p.price}">
      <input id="link" value="${p.buy_link}">
      <button class="btn primary" id="saveBtn">Save</button>
      <button class="btn danger" id="delBtn">Delete</button>
    `;
    document.getElementById("saveBtn").addEventListener("click", async () => {
      await supabase.from("products").update({
        name: document.getElementById("name").value,
        description: document.getElementById("desc").value,
        price: document.getElementById("price").value,
        buy_link: document.getElementById("link").value
      }).eq("id", p.id);
      alert("Updated");
      panel.innerHTML = `<p class="muted">Select an action</p>`;
      loadProducts();
    });
    document.getElementById("delBtn").addEventListener("click", async () => {
      if (!confirm("Delete product?")) return;
      await supabase.from("products").delete().eq("id", p.id);
      panel.innerHTML = `<p class="muted">Select an action</p>`;
      loadProducts();
    });
  }

  // --- ACCOUNT SETTINGS ---
  document.getElementById("settingsBtn").addEventListener("click", async () => {
    panel.innerHTML = `
      <h3>Admin Account</h3>
      <input id="username" placeholder="New username">
      <input id="password" type="password" placeholder="New password">
      <button class="btn primary" id="saveAccBtn">Save</button>
    `;
    document.getElementById("saveAccBtn").addEventListener("click", async () => {
      const user = document.getElementById("username").value.trim();
      const pass = document.getElementById("password").value.trim();
      if (!user && !pass) return alert("Enter username or password");
      const updates = {};
      if (user) updates.username = user;
      if (pass) updates.password = pass;
      await supabase.from("admins").update(updates).eq("id", 1);
      alert("Account updated!");
    });
  });

  // --- INITIAL LOAD ---
  await loadTabs();
  await loadProducts();
});
