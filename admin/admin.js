import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

document.addEventListener("DOMContentLoaded", async () => {

  /* ================= SAFE ENV ================= */
  if (!window.__ENV__) {
    alert("env.js not loaded");
    console.error("env.js missing");
    return;
  }

  const SUPABASE_URL = window.__ENV__.SUPABASE_URL;
  const SUPABASE_ANON_KEY = window.__ENV__.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    alert("Supabase env variables missing");
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /* ================= AUTH ================= */
  if (localStorage.getItem("isAdmin") !== "true") {
    location.href = "../index.html";
    return;
  }

  /* ================= DOM ================= */
  const adminTabs = document.getElementById("adminTabs");
  const adminProducts = document.getElementById("adminProducts");
  const panel = document.getElementById("adminPanel");

  const logoutBtn = document.getElementById("logoutBtn");
  const createTabBtn = document.getElementById("createTabBtn");
  const postProductBtn = document.getElementById("postProductBtn");
  const settingsBtn = document.getElementById("settingsBtn");

  if (!adminTabs || !adminProducts || !panel) {
    console.error("Admin DOM elements missing");
    return;
  }

  let currentTab = "all";

  /* ================= LOGOUT ================= */
  logoutBtn?.addEventListener("click", () => {
    localStorage.clear();
    location.href = "../index.html";
  });

  /* ================= TABS ================= */
  async function loadTabs() {
    adminTabs.innerHTML = "";

    // Always render ALL tab
    renderTab("All", "all");

    const { data: tabs, error } = await supabase
      .from("tabs")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Tabs error:", error);
      return;
    }

    tabs.forEach(tab => renderTab(tab.name, tab.id));
    highlightTabs();
  }

  function renderTab(name, id) {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.textContent = name;
    btn.dataset.id = id;

    btn.addEventListener("click", () => {
      currentTab = id;
      highlightTabs();
      loadProducts();
    });

    // Long press delete (not All)
    if (id !== "all") {
      let timer;
      btn.addEventListener("mousedown", () => {
        timer = setTimeout(() => deleteTab(id, name), 700);
      });
      btn.addEventListener("mouseup", () => clearTimeout(timer));
      btn.addEventListener("mouseleave", () => clearTimeout(timer));
    }

    adminTabs.appendChild(btn);
  }

  function highlightTabs() {
    document.querySelectorAll(".tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.id === currentTab);
    });
  }

  async function deleteTab(id, name) {
    if (!confirm(`Delete "${name}" and all products?`)) return;
    await supabase.from("products").delete().eq("tab_id", id);
    await supabase.from("tabs").delete().eq("id", id);
    currentTab = "all";
    await loadTabs();
    await loadProducts();
  }

  /* ================= PRODUCTS ================= */
async function loadProducts() {
  adminProducts.innerHTML = `<p class="muted">Loading...</p>`;

  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (currentTab !== "all") {
    query = query.eq("tab_id", currentTab);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Products error:", error);
    adminProducts.innerHTML = `<p class="muted">Error loading products</p>`;
    return;
  }

  adminProducts.innerHTML = "";

  if (!data || data.length === 0) {
    adminProducts.innerHTML = `<p class="muted">No products</p>`;
    return;
  }

  data.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.image_url}">
      <div class="info">
        <h4>${p.name}</h4>
        <span>$${p.price}</span>
        <small>👀 ${p.views}</small>

        <div class="admin-card-actions">
          <button class="btn danger delete-btn">Delete</button>
        </div>
      </div>
    `;

    /* ===== LONG PRESS → EDIT ===== */
    let timer;
    card.addEventListener("mousedown", () => {
      timer = setTimeout(() => openEditProduct(p), 700);
    });
    card.addEventListener("mouseup", () => clearTimeout(timer));
    card.addEventListener("mouseleave", () => clearTimeout(timer));

    /* ===== DELETE BUTTON ===== */
    card.querySelector(".delete-btn").addEventListener("click", async (e) => {
      e.stopPropagation(); // prevent triggering long press

      if (!confirm(`Delete "${p.name}"?`)) return;

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", p.id);

      if (error) {
        alert("Failed to delete product");
        console.error(error);
        return;
      }

      card.remove(); // instant UI feedback
    });

    adminProducts.appendChild(card);
  });
          }

  /* ================= CREATE TAB ================= */
  createTabBtn?.addEventListener("click", () => {
    panel.innerHTML = `
      <h3>Create Tab</h3>
      <input id="tabName" placeholder="Tab name">
      <button id="saveTab" class="btn primary">Create</button>
    `;

    document.getElementById("saveTab").onclick = async () => {
      const name = document.getElementById("tabName").value.trim();
      if (!name) return alert("Enter tab name");

      await supabase.from("tabs").insert({ name });
      panel.innerHTML = `<p class="muted">Select an action</p>`;
      loadTabs();
    };
  });

  /* ================= POST PRODUCT ================= */
  postProductBtn?.addEventListener("click", async () => {
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
      <button id="postBtn" class="btn primary">Post</button>
    `;

    document.getElementById("postBtn").onclick = postProduct;
  });

  async function postProduct() {
    const file = document.getElementById("img").files[0];
    if (!file) return alert("Select image");

    const path = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("products").upload(path, file);
    if (uploadError) return alert(uploadError.message);

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

    alert("Product posted");
    panel.innerHTML = `<p class="muted">Select an action</p>`;
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
      <button id="saveBtn" class="btn primary">Save</button>
      <button id="delBtn" class="btn danger">Delete</button>
    `;

    document.getElementById("saveBtn").onclick = async () => {
      await supabase.from("products").update({
        name: document.getElementById("name").value,
        description: document.getElementById("desc").value,
        price: document.getElementById("price").value,
        buy_link: document.getElementById("link").value
      }).eq("id", p.id);

      alert("Updated");
      panel.innerHTML = `<p class="muted">Select an action</p>`;
      loadProducts();
    };

    document.getElementById("delBtn").onclick = async () => {
      if (!confirm("Delete product?")) return;
      await supabase.from("products").delete().eq("id", p.id);
      panel.innerHTML = `<p class="muted">Select an action</p>`;
      loadProducts();
    };
  }

  /* ================= ACCOUNT ================= */
  settingsBtn?.addEventListener("click", () => {
    panel.innerHTML = `
      <h3>Admin Account</h3>
      <input id="username" placeholder="New username">
      <input id="password" type="password" placeholder="New password">
      <button id="saveAcc" class="btn primary">Save</button>
    `;

    document.getElementById("saveAcc").onclick = async () => {
      const updates = {};
      const u = document.getElementById("username").value.trim();
      const p = document.getElementById("password").value.trim();
      if (u) updates.username = u;
      if (p) updates.password = p;
      if (!u && !p) return alert("Nothing to update");

      await supabase.from("admins").update(updates).eq("id", 1);
      alert("Account updated");
    };
  });

  /* ================= INIT ================= */
  await loadTabs();
  await loadProducts();

});
