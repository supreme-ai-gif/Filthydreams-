import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const container = document.getElementById("productContainer");

async function loadProduct() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  container.innerHTML = `
    <div class="product-layout">
      <div class="product-image">
        <img src="${data.image_url}">
      </div>

      <div class="product-info">
        <h2>${data.name}</h2>
        <div class="price">$${data.price}</div>
        <p class="desc">${data.description}</p>
        <div class="views">${data.views || 0} views</div>

        <button class="buy-btn" id="addToCartBtn">
          Add to Cart
        </button>
      </div>
    </div>
  `;

  document.getElementById("addToCartBtn").onclick = () => {
    alert("Added to cart (logic coming next)");
  };
}

loadProduct();
