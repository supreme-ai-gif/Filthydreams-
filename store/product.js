import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const box = document.getElementById("productBox");
const id = new URLSearchParams(location.search).get("id");

async function loadProduct() {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  await supabase.from("products")
    .update({ views: data.views + 1 })
    .eq("id", id);

  box.innerHTML = `
    <div class="layout">
      <img src="${data.image_url}">
      <div>
        <h2>${data.name}</h2>
        <div class="price">$${data.price}</div>
        <p>${data.description}</p>
        <p>👀 ${data.views + 1} views</p>
        <button class="buy" onclick="window.open('${data.buy_link}')">
          Buy Now
        </button>
      </div>
    </div>
  `;
}

loadProduct();
