import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

// 🔐 Protect admin route
if (localStorage.getItem("isAdmin") !== "true") {
  window.location.href = "../login.html";
}

const panel = document.getElementById("adminPanel");

// 🔹 Logout
document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("isAdmin");
  window.location.href = "../login.html";
};

// 🔹 Load Stats
async function loadStats() {
  const { data: products } = await supabase.from("products").select("id, views");
  document.getElementById("productCount").textContent = products?.length || 0;
  const totalViews = products?.reduce((sum, p) => sum + p.views, 0) || 0;
  document.querySelector(".card:nth-child(2) strong").textContent = totalViews;

  const { data: tabs } = await supabase.from("tabs").select("*");
  document.getElementById("tabCount").textContent = tabs?.length || 0;
}
loadStats();

// 🔹 CREATE TAB
document.getElementById("createTabBtn").onclick = () => {
  panel.innerHTML = `
    <h3>Create New Tab</h3>
    <input type="text" id="tabName" placeholder="Tab name" />
    <button id="saveTab">Create</button>
  `;

  document.getElementById("saveTab").onclick = async () => {
    const name = document.getElementById("tabName").value.trim();
    if (!name) return alert("Enter tab name");

    // Insert into Supabase
    const { data, error } = await supabase.from("tabs").insert([{ name }]);
    if (error) {
      console.error(error);
      alert("Failed to create tab: " + error.message);
      return;
    }

    alert("Tab created successfully!");
    loadStats(); // reload stats cards
  };
};
  
// 🔹 POST PRODUCT
document.getElementById("postProductBtn").onclick = () => {
  panel.innerHTML = `
    <h3>Post Product</h3>
    <input type="file" id="productImage" accept="image/*" />
    <input type="text" id="productName" placeholder="Product name" />
    <textarea id="productDesc" placeholder="Description"></textarea>
    <input type="number" id="productPrice" placeholder="Price" />
    <input type="text" id="buyLink" placeholder="Buy link (URL)" />
    <select id="productTab">
      <option value="">-- No Tab / Global --</option>
    </select>
    <button id="submitProduct">Post</button>
  `;

  loadTabsToSelect();

  document.getElementById("submitProduct").onclick = postProduct;
};

// 🔹 Load tabs into select dropdown
async function loadTabsToSelect() {
  const { data: tabs } = await supabase.from("tabs").select("*");
  const select = document.getElementById("productTab");
  if (!tabs) return;

  tabs.forEach(t => {
    const option = document.createElement("option");
    option.value = t.id;
    option.textContent = t.name;
    select.appendChild(option);
  });
}

// 🔹 Post Product Logic
async function postProduct() {
  const file = document.getElementById("productImage").files[0];
  const name = document.getElementById("productName").value;
  const desc = document.getElementById("productDesc").value;
  const price = document.getElementById("productPrice").value;
  const link = document.getElementById("buyLink").value;
  const tabId = document.getElementById("productTab").value || null;

  if (!file || !name || !price || !link) {
    return alert("Fill all required fields");
  }

  const ext = file.name.split(".").pop();
  const fileName = `products/${Date.now()}.${ext}`;

  // Upload to Supabase storage
  const { error: uploadError } = await supabase.storage
    .from("products")
    .upload(fileName, file, { upsert: true });

  if (uploadError) return alert(uploadError.message);

  const { publicURL } = supabase.storage.from("products").getPublicUrl(fileName);

  const { error } = await supabase.from("products").insert([{
    name,
    description: desc,
    price,
    buy_link: link,
    image_url: publicURL,
    tab_id: tabId
  }]);

  if (error) return alert(error.message);

  alert("Product posted successfully!");
  loadStats();
}

// 🔹 Account Settings Placeholder
document.getElementById("settingsBtn").onclick = () => {
  panel.innerHTML = `
    <h3>Account Settings</h3>
    <input placeholder="New Username" />
    <input placeholder="New Password" type="password" />
    <button>Save (Coming soon)</button>
  `;
};
