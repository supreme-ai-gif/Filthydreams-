import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

document.addEventListener("DOMContentLoaded", async () => {

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

  let currentTabId = "all";

  /* ================= LOGOUT ================= */
  logoutBtn.onclick = () => {
    localStorage.clear();
    location.href = "../login.html";
  };

  /* ================= LOAD TABS ================= */
  async function loadTabs() {
    const { data: tabs } = await supabase.from("tabs").select("*");

    adminTabs.innerHTML = "";

    renderTab("All", "all");

    tabs.forEach(tab => renderTab(tab.name, tab.id));
  }

  function renderTab(name, id) {
    const btn = document.createElement("button");
    btn.className = "tab-btn";
    btn.textContent = name;

    if (currentTabId === id) btn.classList.add("active");

    btn.onclick = () => {
      currentTabId = id;
      highlightTabs();
      loadProducts();
    };

    if (id !== "all") {
      let hold;
      btn.onmousedown = () =>
        hold = setTimeout(() => deleteTab(id, name), 700);
      btn.onmouseup = () => clearTimeout(hold);
    }

    adminTabs.appendChild(btn);
  }

  function highlightTabs() {
    document.querySelectorAll(".tab-btn").forEach(b =>
      b.classList.remove("active")
    );
    [...adminTabs.children].find(
      b => b.textContent ===
        (currentTabId === "all" ? "All" : b.textContent)
    )?.classList.add("active");
  }

  /* ================= DELETE TAB ================= */
  async function deleteTab(id, name) {
    if (!confirm(`Delete "${name}" and all its products?`)) return;
    await supabase.from("products").delete().eq("tab_id", id);
    await supabase.from("tabs").delete().eq("id", id);
    currentTabId = "all";
    loadTabs();
    loadProducts();
  }

  /* ================= LOAD PRODUCTS ================= */
  async function loadProducts() {
    let q = supabase.from("products").select("*");

    if (currentTabId !== "all") {
      q = q.eq("tab_id", currentTabId);
    }

    const { data } = await q;
    adminProducts.innerHTML = "";

    if (!data.length) {
      adminProducts.innerHTML = `<p class="muted">No products here</p>`;
      return;
    }

    data.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${p.image_url}">
        <div class="card-info">
          <h4>${p.name}</h4>
          <span>$${p.price}</span>
          <small>👀 ${p.views}</small>
        </div>
      `;

      let press;
      card.onmousedown = () =>
        press = setTimeout(() => openEdit(p), 700);
      card.onmouseup = () => clearTimeout(press);

      adminProducts.appendChild(card);
    });
  }

  /* ================= POST PRODUCT ================= */
  postProductBtn.onclick = async () => {
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

      <button class="primary-btn" id="post">Post</button>
    `;

    post.onclick = postProduct;
  };

  async function postProduct() {
    const file = img.files[0];
    if (!file) return alert("Select image");

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

    alert("Product posted successfully");
    panel.innerHTML = `<p class="muted">Select an action</p>`;
    loadProducts();
  }

  /* ================= EDIT PRODUCT ================= */
  function openEdit(p) {
    panel.innerHTML = `
      <h3>Edit Product</h3>
      <input id="name" value="${p.name}">
      <textarea id="desc">${p.description}</textarea>
      <input id="price" type="number" value="${p.price}">
      <input id="link" value="${p.buy_link}">
      <button class="primary-btn" id="save">Save</button>
      <button class="danger-btn" id="del">Delete</button>
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

  /* ================= CREATE TAB ================= */
  createTabBtn.onclick = () => {
    panel.innerHTML = `
      <h3>Create Tab</h3>
      <input id="tabName" placeholder="Tab name">
      <button class="primary-btn" id="saveTab">Create</button>
    `;

    saveTab.onclick = async () => {
      if (!tabName.value.trim()) return alert("Enter tab name");
      await supabase.from("tabs").insert({ name: tabName.value });
      alert("Tab created");
      loadTabs();
    };
  };

  /* ================= SETTINGS ================= */
  settingsBtn.onclick = () => {
    panel.innerHTML = `
      <h3>Account</h3>
      <p class="muted">Username & password coming next</p>
    `;
  };

  /* ================= INIT ================= */
  await loadTabs();
  await loadProducts();

});
