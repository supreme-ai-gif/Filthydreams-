import { supabase } from "./supabase.js";

const { data: products } = await supabase.from("products").select("*");

products.forEach(p => {
  productsDiv.innerHTML += `
    <div onclick="location.href='product.html?id=${p.id}'">
      <h4>${p.name}</h4>
      <p>$${p.price}</p>
    </div>
  `;
});
