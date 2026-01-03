import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("search");

let allProducts = [];

async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return console.error(error);
  allProducts = data;
  renderProducts(allProducts);
}

function renderProducts(products) {
  productsGrid.innerHTML = "";
  products.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
      <img src="${p.image_url}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.description}</p>
      <p><strong>$${p.price}</strong></p>
      <button onclick="addToCart('${p.id}')">Add to Cart</button>
      <button onclick="window.open('${p.buy_link}','_blank')">Buy Now</button>
    `;

    productsGrid.appendChild(card);
  });
}

// Search functionality
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );
  renderProducts(filtered);
});

// Cart logic
window.addToCart = async function(productId) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("Login first");

  const { error } = await supabase.from("cart").insert([{ user_id: user.id, product_id: productId }]);
  if (error) return alert("Failed to add to cart");

  alert("Added to cart!");
};

// Initial load
fetchProducts();
