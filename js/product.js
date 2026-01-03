import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

// Get product ID from URL
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const imageEl = document.getElementById("productImage");
const nameEl = document.getElementById("productName");
const priceEl = document.getElementById("productPrice");
const descEl = document.getElementById("productDescription");
const buyBtn = document.getElementById("buyNowBtn");

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

  imageEl.src = data.image_url;
  nameEl.textContent = data.name;
  priceEl.textContent = `$${data.price}`;
  descEl.textContent = data.description;

  buyBtn.onclick = () => {
    window.open(data.buy_link, "_blank");
  };

  // (Optional – later)
  // increment view count here
}

loadProduct();
