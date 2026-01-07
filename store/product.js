import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "YOUR_SUPABASE_URL",
  "YOUR_SUPABASE_ANON_KEY"
);

const id = new URLSearchParams(location.search).get("id");
const container = document.getElementById("productPage");

async function loadProduct() {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  container.innerHTML = `
    <div class="product-box">
      <img src="${data.image_url}">
      <div>
        <h2>${data.name}</h2>
        <p class="price">$${data.price}</p>
        <p>${data.description}</p>
        <button>Add to Cart</button>
      </div>
    </div>
  `;
}

loadProduct();
