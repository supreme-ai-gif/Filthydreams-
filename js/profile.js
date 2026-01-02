import { supabase } from "./supabase.js";

saveProfile.onclick = async () => {
  const userId = localStorage.getItem("user");

  await supabase.from("users").update({
    name: name.value,
    country: country.value,
    email: email.value
  }).eq("id", userId);

  location.href = "store.html";
};
