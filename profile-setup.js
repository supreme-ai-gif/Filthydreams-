import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

// Elements
const profileForm = document.getElementById("profileForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const countryInput = document.getElementById("country");

// Get logged-in user ID from localStorage
const userId = localStorage.getItem("userId");
if (!userId) {
  alert("Not logged in!");
  location.href = "../index.html";
}

// Load current user info to populate fields (optional)
async function loadProfile() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return;

  nameInput.value = data.name || "";
  emailInput.value = data.email || "";
  countryInput.value = data.country || "";
}

loadProfile();

// Handle form submission
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const country = countryInput.value.trim();

  if (!name || !email || !country) {
    return alert("Please fill all fields");
  }

  // Update user in Supabase
  const { data, error } = await supabase
    .from("users")
    .update({ name, email, country })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error(error);
    return alert("Failed to save profile");
  }

  // Update localStorage so login logic sees completed profile
  localStorage.setItem("userId", data.id);
  localStorage.setItem("username", data.username || data.name);
  localStorage.setItem("email", data.email);
  localStorage.setItem("country", data.country);

  alert("Profile saved successfully!");
  location.href = "../store/store.html"; // Redirect to store
});
