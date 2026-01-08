import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Supabase client
const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

// Elements
const profileForm = document.getElementById("profileForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const countryInput = document.getElementById("country");

// Get user ID from localStorage (set during registration or login)
const userId = localStorage.getItem("userId");
if (!userId) {
  alert("Not logged in");
  location.href = "./index.html";
}

// Load existing profile if any
async function loadProfile() {
  const { data, error } = await supabase
    .from("users")
    .select("name, email, country")
    .eq("id", userId)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  if (data) {
    nameInput.value = data.name || "";
    emailInput.value = data.email || "";
    countryInput.value = data.country || "";
  }
}

loadProfile();

// Handle form submit
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const country = countryInput.value.trim();

  if (!name || !email || !country) {
    return alert("Please fill all fields");
  }

  const { data, error } = await supabase
    .from("users")
    .update({ name, email, country })
    .eq("id", userId);

  if (error) {
    console.error(error);
    return alert("Failed to save profile");
  }

  alert("Profile saved successfully!");
  location.href = "../store/store.html"; // Redirect to store after setup
});
