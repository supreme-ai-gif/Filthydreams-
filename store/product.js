import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

// get product id from URL
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

if (!productId) {
  alert("Product not found");
  location.href = "index.html";
}

const container = document.getElementById("productContainer");

async function loadProduct() {
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error || !product) {
    container.innerHTML = "<p>Product not found</p>";
    return;
  }

  // increase views
  await supabase
    .from("products")
    .update({ views: product.views + 1 })
    .eq("id", productId);

  container.innerHTML = `
    <div class="product-image">
      <img src="${product.image_url}" alt="${product.name}">
    </div>

    <div class="product-info">
      <h2>${product.name}</h2>
      <p class="price">$${product.price}</p>

      <p class="desc">${product.description || "No description provided."}</p>

      <p class="views">👁 ${product.views + 1} views</p>

      <button class="buy-btn" id="buyBtn">
        Buy Now
      </button>
    </div>
  `;

  document.getElementById("buyBtn").addEventListener("click", () => {
    window.open(product.buy_link, "_blank");
  });
}

loadProduct();
