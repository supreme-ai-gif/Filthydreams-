import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(window.__ENV__.SUPABASE_URL, window.__ENV__.SUPABASE_ANON_KEY);

const profileForm = document.getElementById("profileForm");
const userId = localStorage.getItem("userId");

if (!userId) {
  alert("Not logged in");
  location.href = "./index.html";
}

profileForm.addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const country = document.getElementById("country").value.trim();

  if (!name || !email || !country) {
    return alert("All fields are required");
  }

  const { error } = await supabase
    .from("users")
    .update({ username: name, email, country })
    .eq("id", userId);

  if (error) {
    console.error(error);
    alert("Failed to save profile");
    return;
  }

  alert("Profile saved successfully!");
  location.href = "./store/store.html";
});
