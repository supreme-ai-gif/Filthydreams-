import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

if (localStorage.getItem("isAdmin") !== "true") {
  window.location.href = "../login.html";
}

// DOM Elements
const createTabBtn = document.getElementById("createTabBtn");
const postProductBtn = document.getElementById("postProductBtn");
const tabsContainer = document.getElementById("tabsContainer");
const productsContainer = document.getElementById("productsContainer");

// ADMIN LOGOUT
window.adminLogout = function() {
  localStorage.removeItem("isAdmin");
  window.location.href = "../login.html";
};

// CREATE TAB
createTabBtn.addEventListener("click", async () => {
  const tabName = prompt("Enter tab name:");
  if (!tabName) return;
  const { error } = await supabase.from("tabs").insert([{ name: tabName }]);
  if (error) return alert("Failed to create tab");
  alert("Tab created!");
  loadTabs();
});

// POST PRODUCT
postProductBtn.addEventListener("click", async () => {
  const name = prompt("Product Name:");
  const description = prompt("Product Description:");
  const price = prompt("Price:");
  const image_url = prompt("Image URL:");
  const tab_id = prompt("Tab ID (leave empty for random):");
  const buy_link = prompt("Buy Link:");

  if (!name || !description || !price || !image_url || !buy_link) return alert("All fields required");

  const { error } = await supabase.from("products").insert([{
    name, description, price, image_url, tab_id: tab_id || null, buy_link, views: 0
  }]);

  if (error) return alert("Failed to post product");
  alert("Product posted!");
  loadProducts();
});

// LOAD TABS
async function loadTabs() {
  const { data } = await supabase.from("tabs").select("*");
  tabsContainer.innerHTML = "<h3>Tabs:</h3>";
  data.forEach(t => {
    const div = document.createElement("div");
    div.textContent = `${t.id} - ${t.name}`;
    tabsContainer.appendChild(div);
  });
}

// LOAD PRODUCTS
async function loadProducts() {
  const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  productsContainer.innerHTML = "<h3>Products:</h3>";
  data.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${p.name}</strong> | $${p.price} | Views: ${p.views}
    `;
    productsContainer.appendChild(div);
  });
}

// INITIAL LOAD
loadTabs();
loadProducts();
