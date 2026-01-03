import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const cartItemsDiv = document.getElementById("cartItems");
const user = JSON.parse(localStorage.getItem("user"));

async function fetchCart() {
  if (!user) return alert("Login first");
  const { data, error } = await supabase
    .from("cart")
    .select("*, products(*)")
    .eq("user_id", user.id);

  if (error) return console.error(error);

  renderCart(data);
}

function renderCart(items) {
  cartItemsDiv.innerHTML = "";
  items.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("cart-item");

    div.innerHTML = `
      <h4>${item.products.name}</h4>
      <p>${item.products.description}</p>
      <p><strong>$${item.products.price}</strong></p>
      <button onclick="removeFromCart('${item.id}')">Remove</button>
      <button onclick="window.open('${item.products.buy_link}','_blank')">Buy Now</button>
    `;
    cartItemsDiv.appendChild(div);
  });
}

window.removeFromCart = async function(cartId) {
  const { error } = await supabase.from("cart").delete().eq("id", cartId);
  if (error) return alert("Failed to remove item");
  fetchCart();
};

// Initial load
fetchCart();
