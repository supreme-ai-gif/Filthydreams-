import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

document.addEventListener("DOMContentLoaded", async () => {

  /* ================= ENV ================= */
  const SUPABASE_URL = window.__ENV__.SUPABASE_URL;
  const SUPABASE_ANON_KEY = window.__ENV__.SUPABASE_ANON_KEY;
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /* ================= AUTH CHECK ================= */
  if (localStorage.getItem("isAdmin") !== "true") {
    alert("Not authorized");
    location.href = "../login.html";
    return;
  }

  /* ================= DOM ================= */
  const adminTabs = document.getElementById("adminTabs");
  const adminProducts = document.getElementById("adminProducts");
  const panel = document.getElementById("adminPanel");

  let currentTab = "all";

  /* ================= LOGOUT ================= */
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.clear();
    location.href = "../login.html";
  };

  /* ================= LOAD TABS ================= */
  async function loadTabs() {
    const { data: tabs, error } = await supabase.from("tabs").select("*").order("created_at");
    if (error) return console.error(error);

    adminTabs.innerHTML = "";
    renderTab("All", "all");

    tabs.forEach(tab => renderTab(tab.name, tab.id));
  }

  function renderTab(name, id) {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.textContent = name;
    btn.dataset.id = id;

    if (currentTab === id) btn.classList.add("active");

    btn.onclick = () => {
      currentTab = id;
      highlightTabs();
      loadProducts();
    };

    // long press delete
    if (id !== "all") {
      let timer;
      btn.onmousedown = () => {
        timer = setTimeout(() => deleteTab(id, name), 700);
      };
      btn.onmouseup = btn.onmouseleave = () => clearTimeout(timer);
    }

    adminTabs.appendChild(btn);
  }

  function highlightTabs() {
    document.querySelectorAll(".tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.id === currentTab);
    });
  }

  async function deleteTab(id, name) {
    if (!confirm(`Delete "${name}" and all products inside it?`)) return;
    await supabase.from("products").delete().eq("tab_id", id);
    await supabase.from("tabs").delete().eq("id", id);
    currentTab = "all";
    await loadTabs();
    await loadProducts();
  }

  /* ================= LOAD PRODUCTS ================= */
  async function loadProducts() {
    adminProducts.innerHTML = `<p class="muted">Loading...</p>`;

    let query = supabase.from("products").select("*").order("created_at", { ascending: false });
    if (currentTab !== "all") query = query.eq("tab_id", currentTab);

    const { data, error } = await query;
    if (error) return console.error(error);

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
        </div>
      `;

      let timer;
      card.onmousedown = () => timer = setTimeout(() => openEditProduct(p), 700);
      card.onmouseup = card.onmouseleave = () => clearTimeout(timer);

      adminProducts.appendChild(card);
    });
  }

  /* ================= CREATE TAB ================= */
  document.getElementById("createTabBtn").onclick = () => {
    panel.innerHTML = `
      <h3>Create Tab</h3>
      <input id="tabName" placeholder="Tab name">
      <button class="btn primary" id="saveTab">Create</button>
    `;

    document.getElementById("saveTab").onclick = async () => {
      const name = document.getElementById("tabName").value.trim();
      if (!name) return alert("Enter tab name");

      await supabase.from("tabs").insert({ name });
      panel.innerHTML = `<p class="muted">Select an action</p>`;
      await loadTabs();
    };
  };

  /* ================= POST PRODUCT ================= */
  document.getElementById("postProductBtn").onclick = async () => {
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

    document.getElementById("postBtn").onclick = postProduct;
  };

  async function postProduct() {
    const file = document.getElementById("img").files[0];
    if (!file) return alert("Select an image");

    const filePath = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("products").upload(filePath, file);
    if (uploadError) return alert(uploadError.message);

    const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(filePath);

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
      <button class="btn primary" id="saveBtn">Save</button>
      <button class="btn danger" id="delBtn">Delete</button>
    `;

    document.getElementById("saveBtn").onclick = async () => {
      await supabase.from("products").update({
        name: document.getElementById("name").value,
        description: document.getElementById("desc").value,
        price: document.getElementById("price").value,
        buy_link: document.getElementById("link").value
      }).eq("id", p.id);

      alert("Product updated");
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
  document.getElementById("settingsBtn").onclick = () => {
    panel.innerHTML = `
      <h3>Admin Account</h3>
      <input id="username" placeholder="New username">
      <input id="password" type="password" placeholder="New password">
      <button class="btn primary" id="saveAcc">Save</button>
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
  };

  /* ================= INIT ================= */
  await loadTabs();
  await loadProducts();

});
