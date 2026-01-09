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

  /* =========================
     ADD TO CART (NO AUTH)
  ========================= */
  const addBtn = container.querySelector(".buy-btn");

  addBtn.addEventListener("click", async () => {
    const userId = localStorage.getItem("userId"); // must be UUID

    if (!userId) {
      alert("Please login first");
      return;
    }

    try {
      // Check if item already exists
      const { data: existing, error: fetchError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("product_id", data.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // If exists → update quantity
      if (existing) {
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + 1 })
          .eq("id", existing.id);

        if (updateError) throw updateError;
      } 
      // Else → insert new row
      else {
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            user_id: userId,
            product_id: data.id,
            quantity: 1
          });

        if (insertError) throw insertError;
      }

      alert("Added to cart!");
    } catch (err) {
      console.error("Cart error:", err);
      alert("Failed to add to cart");
    }
  });
}

loadProduct();
