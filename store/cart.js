import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const cartItemsContainer = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");

// --- PROFILE AND LOGOUT BUTTON ---
document.getElementById("profileBtn").addEventListener("click", () => {
  location.href = "./profile.html";
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  location.href = "../index.html";
});

// --- GET USER ID ---
const userProfile = JSON.parse(localStorage.getItem("userProfile"));
if (!userProfile) {
  alert("Please login first");
  location.href = "../index.html";
}

const userId = userProfile.id;

// --- LOAD CART ---
async function loadCart() {
  const { data, error } = await supabase
    .from("cart")
    .select("*, products(*)")
    .eq("user_id", userId);

  if (error) {
    cartItemsContainer.innerHTML = "<p>Error loading cart.</p>";
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    cartTotalEl.textContent = "0.00";
    return;
  }

  cartItemsContainer.innerHTML = "";
  let total = 0;

  data.forEach(item => {
    const product = item.products;
    total += parseFloat(product.price);

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${product.image_url}" alt="${product.name}">
      <div class="cart-item-info">
        <h4>${product.name}</h4>
        <p class="price">$${product.price}</p>
      </div>
      <div class="cart-item-actions">
        <button data-id="${item.id}">Remove</button>
      </div>
    `;
    cartItemsContainer.appendChild(div);

    div.querySelector("button").addEventListener("click", async () => {
      await supabase.from("cart").delete().eq("id", item.id);
      loadCart();
    });
  });

  cartTotalEl.textContent = total.toFixed(2);
}

loadCart();

// --- CHECKOUT BUTTON ---
document.getElementById("checkoutBtn").addEventListener("click", () => {
  alert("Checkout not implemented yet!");
});
