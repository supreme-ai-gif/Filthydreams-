import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = window.__ENV__.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV__.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("profileForm");

// Get current userId from localStorage
const userId = localStorage.getItem("userId");
if (!userId) {
  alert("Not logged in. Redirecting to login...");
  location.href = "../index.html";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const country = document.getElementById("country").value.trim();

  if (!name || !email || !country) {
    return alert("All fields are required");
  }

  // Update user profile
  const { data, error } = await supabase
    .from("users")
    .update({ name, email, country })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error(error);
    alert("Failed to save profile. Make sure your table and RLS policies allow updating.");
    return;
  }

  alert("Profile saved successfully!");
  location.href = "../store/store.html";
});
