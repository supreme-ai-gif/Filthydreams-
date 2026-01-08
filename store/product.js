import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const container = document.getElementById("productBox");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  container.innerHTML = "<p class='error'>Invalid product.</p>";
  throw new Error("No product ID");
}

async function loadProduct() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    container.innerHTML = "<p class='error'>Product not found.</p>";
    return;
  }

  container.innerHTML = `
    <section class="product-page">
      <div class="product-layout">

        <div class="product-image">
          <img src="${data.image_url}" alt="${data.name}">
        </div>

        <div class="product-info">
          <h1>${data.name}</h1>
          <div class="price">$${data.price}</div>
          <p class="desc">${data.description || "No description provided."}</p>
          <p class="views">👀 ${data.views || 0} views</p>

          <button class="buy-btn">Add to Cart</button>
        </div>

      </div>
    </section>
  `;

  // ===== CONNECT "ADD TO CART" =====
  const addBtn = container.querySelector(".buy-btn");
  addBtn.addEventListener("click", async () => {
    const userId = localStorage.getItem("userId"); // must be set on login/profile-setup
    if (!userId) return alert("Please login first");

    try {
      // Add or update cart
      const { error: upsertError } = await supabase
        .from("cart")
        .upsert(
          {
            user_id: userId,
            product_id: data.id,
            quantity: 1,
          },
          { onConflict: ["user_id", "product_id"] }
        );

      if (upsertError) throw upsertError;

      alert("Added to cart!");
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    }
  });
}

loadProduct();
