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

  // ===== ADD TO CART USING LOCALSTORAGE =====
  const addBtn = container.querySelector(".buy-btn");
  addBtn.addEventListener("click", () => {
    let cart = JSON.parse(localStorage.getItem("cartItems") || "[]");

    // Check if product already in cart
    const existingIndex = cart.findIndex(item => item.id === data.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ id: data.id, quantity: 1 });
    }

    localStorage.setItem("cartItems", JSON.stringify(cart));
    alert("Added to cart!");
  });
}

loadProduct();
