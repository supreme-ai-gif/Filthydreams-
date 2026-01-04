import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

// 🔐 Protect admin
if (localStorage.getItem("isAdmin") !== "true") {
  window.location.href = "../login.html";
}

const panel = document.getElementById("adminPanel");

// Logout
document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("isAdmin");
  window.location.href = "../login.html";
};

// Post Product UI
document.getElementById("postProductBtn").onclick = () => {
  panel.innerHTML = `
    <h3>Post Product</h3>

    <input type="file" id="productImage" accept="image/*" />
    <input type="text" id="productName" placeholder="Product name" />
    <textarea id="productDesc" placeholder="Description"></textarea>
    <input type="number" id="productPrice" placeholder="Price" />
    <input type="text" id="buyLink" placeholder="Buy link (URL)" />

    <button id="submitProduct">Post</button>
  `;

  document.getElementById("submitProduct").onclick = postProduct;
};

async function postProduct() {
  const file = document.getElementById("productImage").files[0];
  const name = document.getElementById("productName").value;
  const desc = document.getElementById("productDesc").value;
  const price = document.getElementById("productPrice").value;
  const link = document.getElementById("buyLink").value;

  if (!file || !name || !price || !link) {
    alert("Fill all required fields");
    return;
  }

  const ext = file.name.split(".").pop();
  const fileName = `products/${Date.now()}.${ext}`;

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
  }]);

  if (error) return alert(error.message);

  alert("Product posted successfully!");
}
document.getElementById("createTabBtn").onclick = () => {
  panel.innerHTML = `
    <h3>Create New Tab</h3>
    <input type="text" id="tabName" placeholder="Tab name" />
    <button id="saveTab">Create</button>
  `;

  document.getElementById("saveTab").onclick = async () => {
    const name = document.getElementById("tabName").value;
    if (!name) return alert("Enter tab name");

    const { error } = await supabase.from("tabs").insert([{ name }]);
    if (error) return alert(error.message);

    alert("Tab created successfully!");
    loadTabs(); // optional: reload stats
  };
};
// Settings placeholder
document.getElementById("settingsBtn").onclick = () => {
  panel.innerHTML = `
    <h3>Account Settings</h3>
    <input placeholder="New Username" />
    <input placeholder="New Password" type="password" />
    <button>Save (Coming soon)</button>
  `;
};
