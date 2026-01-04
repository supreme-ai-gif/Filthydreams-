import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

document.addEventListener("DOMContentLoaded", async () => {

  const supabase = createClient(window.__ENV__.SUPABASE_URL, window.__ENV__.SUPABASE_ANON_KEY);

  if (localStorage.getItem("isAdmin") !== "true") location.href = "../login.html";

  const adminTabs = document.getElementById("adminTabs");
  const adminProducts = document.getElementById("adminProducts");
  const panel = document.getElementById("adminPanel");

  let currentTab = "all";

  // LOGOUT
  logoutBtn.onclick = () => { localStorage.clear(); location.href = "../login.html"; };

  /* ================ LOAD TABS ================ */
  async function loadTabs() {
    const { data: tabs } = await supabase.from("tabs").select("*");
    adminTabs.innerHTML = "";
    renderTab("All", "all");
    tabs.forEach(t => renderTab(t.name, t.id));
  }

  function renderTab(name, id) {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.textContent = name;
    if (currentTab === id) btn.classList.add("active");
    btn.onclick = () => { currentTab = id; highlightTabs(); loadProducts(); };

    if (id !== "all") {
      let timer;
      btn.onmousedown = () => timer = setTimeout(() => deleteTab(id, name), 700);
      btn.onmouseup = () => clearTimeout(timer);
    }

    adminTabs.appendChild(btn);
  }

  function highlightTabs() {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    [...adminTabs.children].find(b => b.textContent === (currentTab==="all"?"All":b.textContent))?.classList.add("active");
  }

  async function deleteTab(id, name) {
    if (!confirm(`Delete "${name}" and all products?`)) return;
    await supabase.from("products").delete().eq("tab_id", id);
    await supabase.from("tabs").delete().eq("id", id);
    currentTab = "all";
    await loadTabs();
    await loadProducts();
  }

  /* ================ LOAD PRODUCTS ================ */
  async function loadProducts() {
    let query = supabase.from("products").select("*");
    if (currentTab !== "all") query = query.eq("tab_id", currentTab);
    const { data } = await query;
    adminProducts.innerHTML = "";
    if (!data || data.length === 0) return adminProducts.innerHTML=`<p class="muted">No products</p>`;

    data.forEach(p=>{
      const card=document.createElement("div");
      card.className="product-card";
      card.innerHTML=`<img src="${p.image_url}"><div class="info"><h4>${p.name}</h4><span>$${p.price}</span><small>👀 ${p.views}</small></div>`;
      let hold;
      card.onmousedown = ()=> hold=setTimeout(()=>editProduct(p),700);
      card.onmouseup = ()=> clearTimeout(hold);
      adminProducts.appendChild(card);
    });
  }

  /* ================ CREATE TAB ================ */
  createTabBtn.onclick=()=>{
    panel.innerHTML=`<h3>Create Tab</h3><input id="tabName" placeholder="Tab name"><button class="btn primary" id="saveTab">Create</button>`;
    document.getElementById("saveTab").onclick=async()=>{
      if(!document.getElementById("tabName").value.trim()) return alert("Enter tab name");
      await supabase.from("tabs").insert({name:document.getElementById("tabName").value});
      alert("Tab created"); await loadTabs();
      panel.innerHTML=`<p class="muted">Select an action</p>`;
    };
  };

  /* ================ POST PRODUCT ================ */
  postProductBtn.onclick=async()=>{
    const {data: tabs}=await supabase.from("tabs").select("*");
    panel.innerHTML=`
      <h3>Post Product</h3>
      <input type="file" id="img">
      <input id="name" placeholder="Product name">
      <textarea id="desc" placeholder="Description"></textarea>
      <input id="price" type="number" placeholder="Price">
      <input id="link" placeholder="Buy link">
      <select id="tab"><option value="">All</option>${tabs.map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}</select>
      <button class="btn primary" id="post">Post</button>`;
    document.getElementById("post").onclick=postProduct;
  };

  async function postProduct() {
    const file=document.getElementById("img").files[0];
    if(!file) return alert("Select image");
    const path=`products/${Date.now()}-${file.name}`;
    await supabase.storage.from("products").upload(path,file);
    const {publicURL}=supabase.storage.from("products").getPublicUrl(path);
    await supabase.from("products").insert({
      name:document.getElementById("name").value,
      description:document.getElementById("desc").value,
      price:document.getElementById("price").value,
      buy_link:document.getElementById("link").value,
      image_url:publicURL,
      tab_id:document.getElementById("tab").value||null,
      views:0
    });
    alert("Product posted!");
    await loadProducts();
    panel.innerHTML=`<p class="muted">Select an action</p>`;
  }

  /* ================ EDIT PRODUCT ================ */
  function editProduct(p){
    panel.innerHTML=`
      <h3>Edit Product</h3>
      <input id="name" value="${p.name}">
      <textarea id="desc">${p.description}</textarea>
      <input id="price" type="number" value="${p.price}">
      <input id="link" value="${p.buy_link}">
      <button class="btn primary" id="save">Save</button>
      <button class="btn danger" id="del">Delete</button>`;
    document.getElementById("save").onclick=async()=>{
      await supabase.from("products").update({
        name:document.getElementById("name").value,
        description:document.getElementById("desc").value,
        price:document.getElementById("price").value,
        buy_link:document.getElementById("link").value
      }).eq("id",p.id);
      alert("Updated"); loadProducts();
    };
    document.getElementById("del").onclick=async()=>{
      if(!confirm("Delete product?")) return;
      await supabase.from("products").delete().eq("id",p.id);
      loadProducts();
    };
  }

  /* ================ ACCOUNT SETTINGS ================ */
  settingsBtn.onclick=()=>{
    panel.innerHTML=`
      <h3>Admin Account</h3>
      <input id="username" placeholder="New username">
      <input id="password" type="password" placeholder="New password">
      <button class="btn primary" id="saveAcc">Save</button>`;
    document.getElementById("saveAcc").onclick=async()=>{
      const user=document.getElementById("username").value.trim();
      const pass=document.getElementById("password").value.trim();
      if(!user&&!pass) return alert("Enter username or password");
      const updates={};
      if(user) updates.username=user;
      if(pass) updates.password=pass;
      await supabase.from("admins").update(updates).eq("id",1);
      alert("Account updated");
    };
  };

  /* ================ INIT ================ */
  await loadTabs();
  await loadProducts();

});
