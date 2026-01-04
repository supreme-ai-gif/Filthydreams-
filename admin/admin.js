import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

if (localStorage.getItem("isAdmin") !== "true") {
  location.href = "../login.html";
}

const adminTabs = document.getElementById("adminTabs");
const adminProducts = document.getElementById("adminProducts");
const panel = document.getElementById("adminPanel");

let currentTabId = null;

/* ================= LOAD TABS ================= */
async function loadTabs() {
  const { data: tabs } = await supabase.from("tabs").select("*");

  adminTabs.innerHTML = "";

  const allBtn = createTabButton("All", null);
  adminTabs.appendChild(allBtn);

  tabs.forEach(tab => {
    adminTabs.appendChild(createTabButton(tab.name, tab.id));
  });
}

/* ================= TAB BUTTON ================= */
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

  // Long press delete (NOT for All)
  if (id !== null) {
    let timer;
    btn.onmousedown = () =>
      timer = setTimeout(() => deleteTab(id, name), 700);
    btn.onmouseup = () => clearTimeout(timer);
  }

  return btn;
}

/* ================= HIGHLIGHT ================= */
function highlightTabs() {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  [...adminTabs.children].find(
    b => b.textContent === (currentTabId ? b.textContent : "All")
  )?.classList.add("active");
}

/* ================= DELETE TAB ================= */
async function deleteTab(id, name) {
  if (!confirm(`Delete "${name}" and ALL products?`)) return;

  await supabase.from("products").delete().eq("tab_id", id);
  await supabase.from("tabs").delete().eq("id", id);

  currentTabId = null;
  loadTabs();
  loadProducts();
}

/* ================= LOAD PRODUCTS ================= */
async function loadProducts() {
  let q = supabase.from("products").select("*");

  if (currentTabId !== null) {
    q = q.eq("tab_id", currentTabId);
  }

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
    card.onmousedown = () => t = setTimeout(() => openEdit(p), 700);
    card.onmouseup = () => clearTimeout(t);

    adminProducts.appendChild(card);
  });
}

/* ================= POST PRODUCT UI ================= */
document.getElementById("postProductBtn").onclick = async () => {
  const { data: tabs } = await supabase.from("tabs").select("*");

  panel.innerHTML = `
    <h3>Post Product</h3>
    <input type="file" id="img">
    <input id="name" placeholder="Name">
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

/* ================= POST PRODUCT ================= */
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

  alert("✅ Product created successfully");
  panel.innerHTML = "";
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

/* ================= INIT ================= */
loadTabs();
loadProducts();
