import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const userId = localStorage.getItem("userId"); // must be set on login
const container = document.getElementById("cartContainer");

if (!userId) {
  container.innerHTML = "<p>Please login first.</p>";
  throw new Error("No user ID in localStorage");
}

async function loadCart() {
  const { data, error } = await supabase
    .from("cart")
    .select(`
      id,
      quantity,
      product_id,
      products(*)   -- join to get product info
    `)
    .eq("user_id", userId);

  if (error) {
    console.error(error);
    container.innerHTML = "<p>Error loading cart.</p>";
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  container.innerHTML = "";
  data.forEach(item => {
    const p = item.products;
    const card = document.createElement("div");
    card.className = "cart-item";
    card.innerHTML = `
      <img src="${p.image_url}" alt="${p.name}">
      <div class="info">
        <h4>${p.name}</h4>
        <span>$${p.price} x ${item.quantity}</span>
      </div>
      <div class="actions">
        <button class="add">+</button>
        <button class="remove">-</button>
        <button class="delete">Remove</button>
        <button class="buy" onclick="window.open('${p.buy_link}','_blank')">Buy</button>
      </div>
    `;

    // Quantity + / -
    card.querySelector(".add").addEventListener("click", async () => {
      await supabase.from("cart").update({ quantity: item.quantity + 1 }).eq("id", item.id);
      loadCart();
    });
    card.querySelector(".remove").addEventListener("click", async () => {
      if (item.quantity <= 1) return;
      await supabase.from("cart").update({ quantity: item.quantity - 1 }).eq("id", item.id);
      loadCart();
    });

    // Delete
    card.querySelector(".delete").addEventListener("click", async () => {
      if (!confirm("Remove this item from cart?")) return;
      await supabase.from("cart").delete().eq("id", item.id);
      loadCart();
    });

    container.appendChild(card);
  });
}

loadCart();
