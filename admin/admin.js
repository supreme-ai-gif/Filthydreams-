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

/* ---------------- LOGOUT ---------------- */
logoutBtn.onclick = () => {
  localStorage.clear();
  location.href = "../login.html";
};

/* ---------------- LOAD STATS ---------------- */
async function loadStats() {
  const { data: products } = await supabase.from("products").select("views");
  const { data: tabs } = await supabase.from("tabs").select("id");

  document.getElementById("productCount").textContent = products.length;
  document.getElementById("tabCount").textContent = tabs.length;
  document.getElementById("viewCount").textContent =
    products.reduce((a, b) => a + b.views, 0);
}

/* ---------------- LOAD TABS ---------------- */
async function loadTabs() {
  const { data } = await supabase.from("tabs").select("*");
  adminTabs.innerHTML = `<button class="tab active" data-id="">All</button>`;

  data.forEach(tab => {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.textContent = tab.name;

    btn.onclick = () => loadProducts(tab.id);

    // LONG PRESS DELETE
    let timer;
    btn.onmousedown = () => {
      timer = setTimeout(() => deleteTab(tab.id, tab.name), 800);
    };
    btn.onmouseup = () => clearTimeout(timer);

    adminTabs.appendChild(btn);
  });
}

/* ---------------- DELETE TAB + PRODUCTS ---------------- */
async function deleteTab(tabId, name) {
  if (!confirm(`Delete "${name}" and ALL its products?`)) return;

  await supabase.from("products").delete().eq("tab_id", tabId);
  await supabase.from("tabs").delete().eq("id", tabId);

  loadTabs();
  loadProducts();
  loadStats();
}

/* ---------------- LOAD PRODUCTS ---------------- */
async function loadProducts(tabId = null) {
  let q = supabase.from("products").select("*");
  if (tabId) q = q.eq("tab_id", tabId);

  const { data } = await q;
  adminProducts.innerHTML = "";

  data.forEach(p => {
    const card = document.createElement("div");
    card.className = "admin-product";
    card.innerHTML = `
      <img src="${p.image_url}" />
      <div class="info">
        <strong>${p.name}</strong>
        <span>$${p.price}</span>
        <small>👀 ${p.views}</small>
      </div>
    `;

    // LONG PRESS EDIT
    let timer;
    card.onmousedown = () => {
      timer = setTimeout(() => openEditProduct(p), 800);
    };
    card.onmouseup = () => clearTimeout(timer);

    adminProducts.appendChild(card);
  });
}

/* ---------------- EDIT PRODUCT ---------------- */
function openEditProduct(p) {
  panel.innerHTML = `
    <h3>Edit Product</h3>
    <input type="file" id="img" />
    <input id="name" value="${p.name}" />
    <textarea id="desc">${p.description}</textarea>
    <input id="price" type="number" value="${p.price}" />
    <input id="link" value="${p.buy_link}" />
    <button id="save">Save</button>
    <button id="delete" style="background:red">Delete</button>
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

  delete.onclick = async () => {
    if (!confirm("Delete product?")) return;
    await supabase.from("products").delete().eq("id", p.id);
    loadProducts();
    loadStats();
  };
}

/* ---------------- SETTINGS ---------------- */
settingsBtn.onclick = () => {
  panel.innerHTML = `
    <h3>Account Settings</h3>
    <input id="newUser" placeholder="New Username" />
    <input id="newPass" type="password" placeholder="New Password" />
    <button id="saveAdmin">Save</button>
  `;

  saveAdmin.onclick = () => {
    alert("Logic ready – will connect auth next");
  };
};

/* ---------------- CREATE TAB / POST PRODUCT ---------------- */
createTabBtn.onclick = () => panel.innerHTML = `
  <h3>Create Tab</h3>
  <input id="tabName" />
  <button onclick="createTab()">Create</button>
`;

window.createTab = async () => {
  await supabase.from("tabs").insert({ name: tabName.value });
  loadTabs(); loadStats();
};

postProductBtn.onclick = () => {
  panel.innerHTML = `<p>Use previous post interface (already working)</p>`;
};

/* INIT */
loadStats();
loadTabs();
loadProducts();
