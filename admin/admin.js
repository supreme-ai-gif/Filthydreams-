import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

if (localStorage.getItem("isAdmin") !== "true") {
  location.href = "../login.html";
}

const panel = document.getElementById("adminPanel");
const adminTabs = document.getElementById("adminTabs");
const adminProducts = document.getElementById("adminProducts");

/* ================= LOGOUT ================= */
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  location.href = "../login.html";
};

/* ================= STATS ================= */
async function loadStats() {
  const { data: products } = await supabase.from("products").select("views");
  const { data: tabs } = await supabase.from("tabs").select("id");

  document.getElementById("productCount").textContent = products.length;
  document.getElementById("tabCount").textContent = tabs.length;
  document.getElementById("viewCount").textContent =
    products.reduce((a, b) => a + b.views, 0);
}

/* ================= TABS ================= */
async function loadTabs() {
  const { data } = await supabase.from("tabs").select("*");
  adminTabs.innerHTML = `<button class="tab active">All</button>`;

  data.forEach(tab => {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.textContent = tab.name;

    btn.onclick = () => loadProducts(tab.id);

    let pressTimer;
    btn.onmousedown = () =>
      pressTimer = setTimeout(() => deleteTab(tab.id, tab.name), 700);
    btn.onmouseup = () => clearTimeout(pressTimer);

    adminTabs.appendChild(btn);
  });
}

/* ================= DELETE TAB ================= */
async function deleteTab(id, name) {
  if (!confirm(`Delete "${name}" and ALL its products?`)) return;
  await supabase.from("products").delete().eq("tab_id", id);
  await supabase.from("tabs").delete().eq("id", id);
  loadTabs();
  loadProducts();
  loadStats();
}

/* ================= PRODUCTS ================= */
async function loadProducts(tabId = null) {
  let q = supabase.from("products").select("*");
  if (tabId) q = q.eq("tab_id", tabId);

  const { data } = await q;
  adminProducts.innerHTML = "";

  data.forEach(p => {
    const card = document.createElement("div");
    card.className = "admin-product";
    card.innerHTML = `
      <img src="${p.image_url}">
      <div class="info">
        <strong>${p.name}</strong>
        <span>$${p.price}</span>
        <small>👀 ${p.views}</small>
      </div>
    `;

    let timer;
    card.onmousedown = () =>
      timer = setTimeout(() => openEditProduct(p), 700);
    card.onmouseup = () => clearTimeout(timer);

    adminProducts.appendChild(card);
  });
}

/* ================= CREATE TAB ================= */
document.getElementById("createTabBtn").onclick = () => {
  panel.innerHTML = `
    <h3>Create Tab</h3>
    <input id="tabName" placeholder="Tab name">
    <button id="saveTab">Create</button>
  `;

  document.getElementById("saveTab").onclick = async () => {
    if (!tabName.value.trim()) return alert("Enter tab name");
    await supabase.from("tabs").insert({ name: tabName.value });
    panel.innerHTML = `<p class="placeholder">Tab created</p>`;
    loadTabs();
    loadStats();
  };
};

/* ================= POST PRODUCT ================= */
document.getElementById("postProductBtn").onclick = () => {
  panel.innerHTML = `
    <h3>Post Product</h3>
    <input type="file" id="img" accept="image/*">
    <input id="name" placeholder="Product name">
    <textarea id="desc" placeholder="Description"></textarea>
    <input id="price" type="number" placeholder="Price">
    <input id="link" placeholder="Buy link">
    <button id="post">Post</button>
  `;

  document.getElementById("post").onclick = postProduct;
};

/* ================= POST PRODUCT LOGIC ================= */
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
    views: 0
  });

  panel.innerHTML = `<p class="placeholder">Product posted</p>`;
  loadProducts();
  loadStats();
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

    loadProducts();
    loadStats();
    alert("Updated");
  };

  del.onclick = async () => {
    if (!confirm("Delete product?")) return;
    await supabase.from("products").delete().eq("id", p.id);
    loadProducts();
    loadStats();
  };
}

/* ================= SETTINGS ================= */
document.getElementById("settingsBtn").onclick = () => {
  panel.innerHTML = `
    <h3>Admin Settings</h3>
    <input placeholder="New username">
    <input type="password" placeholder="New password">
    <button>Save (Auth next)</button>
  `;
};

/* ================= INIT ================= */
loadStats();
loadTabs();
loadProducts();
