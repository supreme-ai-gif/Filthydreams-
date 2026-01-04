import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔹 Initialize Supabase
const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

// 🔹 Get product ID from URL
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// 🔹 DOM Elements
const imageEl = document.getElementById("productImage");
const nameEl = document.getElementById("productName");
const priceEl = document.getElementById("productPrice");
const descEl = document.getElementById("productDescription");
const buyBtn = document.getElementById("buyNowBtn");

// 🔹 Load product
async function loadProduct() {
  if (!productId) {
    alert("Product not found");
    return;
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error || !data) {
    alert("Failed to load product");
    return;
  }

  // Display product data
  imageEl.src = data.image_url;
  nameEl.textContent = data.name;
  priceEl.textContent = `$${data.price}`;
  descEl.textContent = data.description;

  // Buy Now redirect
  buyBtn.onclick = () => {
    if (!data.buy_link) return alert("No buy link set");
    window.open(data.buy_link, "_blank");
  };

  // 🔹 Increment view counter
  try {
    await supabase
      .from("products")
      .update({ views: data.views + 1 })
      .eq("id", productId);
  } catch (e) {
    console.error("Failed to increment view:", e);
  }
}

// 🔹 Initialize
loadProduct();
