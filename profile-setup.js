import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

// Elements
const profileForm = document.getElementById("profileForm");

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const country = document.getElementById("country").value.trim();

  if (!name || !email || !country) {
    return alert("Please fill all fields");
  }

  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("Not logged in");
    location.href = "../index.html";
    return;
  }

  const { error } = await supabase
    .from("users")
    .update({ name, email, country })
    .eq("id", userId);

  if (error) {
    console.error(error);
    alert("Failed to save profile");
    return;
  }

  // Save in localStorage
  localStorage.setItem(
    "userProfile",
    JSON.stringify({ name, email, country })
  );

  alert("Profile saved successfully!");
  location.href = "./store.html";
});
