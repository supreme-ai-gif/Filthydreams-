const supabase = window.supabase.createClient(
  "YOUR_SUPABASE_URL",
  "YOUR_PUBLIC_ANON_KEY"
);

const container = document.getElementById("cartContainer");
const totalEl = document.getElementById("total");

let userId = null;

// Auth check
(async () => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    alert("Please login first");
    location.href = "../index.html";
    return;
  }
  userId = data.user.id;
  loadCart();
})();

async function loadCart() {
  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    alert("Failed to load cart");
    console.error(error);
    return;
  }

  renderCart(data);
}

function renderCart(items) {
  container.innerHTML = "";
  let total = 0;

  items.forEach(item => {
    total += item.price * item.quantity;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.image_url}">
      <div class="cart-info">
        <h4>${item.name}</h4>
        <span>$${item.price}</span>
      </div>
      <div class="controls">
        <div class="qty">
          <button onclick="updateQty('${item.id}', ${item.quantity - 1})">−</button>
          <strong>${item.quantity}</strong>
          <button onclick="updateQty('${item.id}', ${item.quantity + 1})">+</button>
        </div>
        <div class="remove" onclick="removeItem('${item.id}')">Remove</div>
      </div>
    `;
    container.appendChild(div);
  });

  totalEl.textContent = `$${total.toFixed(2)}`;
}

async function updateQty(id, qty) {
  if (qty <= 0) {
    await removeItem(id);
    return;
  }

  await supabase
    .from("cart_items")
    .update({ quantity: qty })
    .eq("id", id);

  loadCart();
}

async function removeItem(id) {
  await supabase
    .from("cart_items")
    .delete()
    .eq("id", id);

  loadCart();
}

// Back
document.getElementById("backBtn").onclick = () => {
  location.href = "./store.html";
};

// Checkout placeholder
document.getElementById("checkoutBtn").onclick = () => {
  alert("Checkout coming soon 🚀");
};
