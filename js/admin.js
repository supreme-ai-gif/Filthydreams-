import { supabase } from "./supabase.js";
if (localStorage.getItem("isAdmin") !== "true") {
  window.location.href = "../login.html";
}
createTab.onclick = async () => {
  const name = prompt("Tab name");
  await supabase.from("tabs").insert({ name });
};

postProduct.onclick = async () => {
  const name = prompt("Product name");
  const price = prompt("Price");
  const link = prompt("Buy link");

  await supabase.from("products").insert({
    name,
    price,
    buy_link: link,
    views: 0
  });
};
