import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = window.__ENV__.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV__.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const avatarPreview = document.getElementById("avatarPreview");
const avatarInput = document.getElementById("avatarInput");
const profileForm = document.getElementById("profileForm");
const emailInput = document.getElementById("email");

let avatarFile = null;

// --- CHECK USER ID ---
const userId = localStorage.getItem("userId");
if (!userId) {
  alert("Not logged in!");
  location.href = "../index.html";
}

// --- AVATAR CLICK ---
avatarPreview.addEventListener("click", () => avatarInput.click());
avatarInput.addEventListener("change", () => {
  if (avatarInput.files && avatarInput.files[0]) {
    avatarFile = avatarInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
    };
    reader.readAsDataURL(avatarFile);
  }
});

// --- SUBMIT PROFILE ---
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email) return alert("Enter your email");

  let avatarUrl = null;

  // Upload avatar if selected
  if (avatarFile) {
    const path = `avatars/${Date.now()}-${avatarFile.name}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, avatarFile);
    if (uploadError) return alert("Avatar upload failed");
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    avatarUrl = data.publicUrl;
  }

  // Update user in Supabase
  const { error } = await supabase.from("users").update({
    email,
    avatar_url: avatarUrl
  }).eq("id", userId);

  if (error) return alert("Failed to save profile");

  // Save profile locally
  localStorage.setItem("userProfile", JSON.stringify({
    name: email.split("@")[0],
    email,
    avatar: avatarUrl || ""
  }));

  alert("Profile saved successfully!");
  location.href = "./store.html";
});
