import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = window.__ENV__.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV__.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const container = document.getElementById("productContainer");
const productId = new URLSearchParams(window.location.search).get("id");

if (!productId) {
  container.innerHTML = "<p>Product not found</p>";
  throw new Error("No product ID");
}

async function loadProduct() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error) {
    console.error(error);
    container.innerHTML = "<p>Error loading product</p>";
    return;
  }

  // increment views
  await supabase
    .from("products")
    .update({ views: data.views + 1 })
    .eq("id", productId);

  container.innerHTML = `
    <div class="product-layout">
      <div class="product-image">
        <img src="${data.image_url}">
      </div>
      <div class="product-info">
        <h2>${data.name}</h2>
        <div class="price">$${data.price}</div>
        <p class="desc">${data.description}</p>
        <p class="views">👀 ${data.views + 1} views</p>
        <button class="buy-btn" onclick="window.open('${data.buy_link}', '_blank')">
          Buy Now
        </button>
      </div>
    </div>
  `;
}

loadProduct();
