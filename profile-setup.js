import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(window.__ENV__.SUPABASE_URL, window.__ENV__.SUPABASE_ANON_KEY);

const form = document.getElementById("profileForm");

form.addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const country = document.getElementById("country").value.trim();
  const userId = localStorage.getItem("userId");

  if (!userId) return alert("Not logged in");

  const { data, error } = await supabase
    .from("users")
    .update({ name, email, country })
    .eq("id", userId)
    .select()
    .single();

  if (error) { console.error(error); return alert("Failed to save profile"); }

  alert("Profile saved!");
  location.href = "./store/store.html";
});
