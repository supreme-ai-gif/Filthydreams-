import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const cartContainer = document.getElementById("cartContainer");
const cartTotalEl = document.getElementById("cartTotal");
const backBtn = document.getElementById("backBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

backBtn.addEventListener("click", () => location.href = "./store.html");
checkoutBtn.addEventListener("click", () => alert("Checkout not implemented yet"));

// --- Get current user ---
const user = supabase.auth.user();
if (!user) {
  alert("Please login first");
  location.href = "../index.html";
}

async function loadCart() {
  const { data, error } = await supabase
    .from("cart")
    .select(`*, products(*)`)
    .eq("user_id", user.id);

  if (error) {
    cartContainer.innerHTML = "<p class='error'>Failed to load cart</p>";
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty</p>";
    cartTotalEl.textContent = "0";
    return;
  }

  let total = 0;
  cartContainer.innerHTML = "";
  data.forEach(item => {
    const product = item.products;
    total += product.price * item.quantity;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${product.image_url}" alt="${product.name}">
      <div class="cart-info">
        <h4>${product.name}</h4>
        <div class="price">$${product.price}</div>
        <div class="quantity">
          <label>Qty:</label>
          <input type="number" min="1" value="${item.quantity}" data-id="${item.id}">
        </div>
        <button class="remove-btn" data-id="${item.id}">Remove</button>
      </div>
    `;
    cartContainer.appendChild(div);
  });

  cartTotalEl.textContent = total.toFixed(2);

  // --- Quantity change ---
  document.querySelectorAll(".cart-info input").forEach(input => {
    input.addEventListener("change", async () => {
      const newQty = parseInt(input.value);
      const cartId = input.dataset.id;
      if (newQty < 1) return;
      await supabase.from("cart").update({ quantity: newQty }).eq("id", cartId);
      loadCart();
    });
  });

  // --- Remove item ---
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const cartId = btn.dataset.id;
      await supabase.from("cart").delete().eq("id", cartId);
      loadCart();
    });
  });
}

loadCart();
