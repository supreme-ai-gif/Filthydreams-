import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const form = document.getElementById("profileForm");

form.onsubmit = async e => {
  e.preventDefault();

  const userId = localStorage.getItem("userId");
  if (!userId) return location.href = "./index.html";

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const country = countryInput.value.trim();

  const { error } = await supabase
    .from("users")
    .update({ name, email, country })
    .eq("id", userId);

  if (error) {
    console.error(error);
    return alert("Failed to save profile");
  }

  location.href = "./store/store.html";
};
