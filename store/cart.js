import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const container = document.getElementById("cartContainer");
const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", () => {
  location.href = "./store.html";
});

async function loadCart() {
  let cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  container.innerHTML = "";

  for (let item of cart) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", item.id)
      .single();

    if (error || !data) continue;

    const productEl = document.createElement("div");
    productEl.classList.add("cart-item");
    productEl.innerHTML = `
      <img src="${data.image_url}" alt="${data.name}">
      <div>
        <h4>${data.name}</h4>
        <p>Price: $${data.price}</p>
        <p>Quantity: ${item.quantity}</p>
        <button class="remove-btn">Remove</button>
      </div>
    `;

    const removeBtn = productEl.querySelector(".remove-btn");
    removeBtn.addEventListener("click", () => {
      cart = cart.filter(c => c.id !== item.id);
      localStorage.setItem("cartItems", JSON.stringify(cart));
      loadCart();
    });

    container.appendChild(productEl);
  }
}

loadCart();
