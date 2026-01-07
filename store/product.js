import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

if (!window.__ENV__) {
  alert("ENV not loaded");
  throw new Error("env.js not loaded");
}

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const box = document.getElementById("productBox");
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

if (!productId) {
  box.innerHTML = "<p style='padding:40px'>Invalid product.</p>";
  throw new Error("No product ID");
}

async function loadProduct() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error || !data) {
    console.error(error);
    box.innerHTML = "<p style='padding:40px'>Product not found.</p>";
    return;
  }

  // update views
  await supabase
    .from("products")
    .update({ views: (data.views || 0) + 1 })
    .eq("id", productId);

  box.innerHTML = `
    <div class="layout">
      <img src="${data.image_url}" alt="${data.name}">
      <div>
        <h2>${data.name}</h2>
        <div class="price">$${data.price}</div>
        <p>${data.description || "No description provided."}</p>
        <p>👀 ${(data.views || 0) + 1} views</p>

        <button class="buy" ${
          data.buy_link
            ? `onclick="window.open('${data.buy_link}', '_blank')"`
            : "disabled"
        }>
          ${data.buy_link ? "Buy Now" : "Unavailable"}
        </button>
      </div>
    </div>
  `;
}

loadProduct();
