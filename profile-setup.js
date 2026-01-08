import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const profileForm = document.getElementById("profileForm");
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");

// Get current user ID from localStorage
const userId = localStorage.getItem("userId");
if (!userId) {
  alert("Not logged in");
  location.href = "../index.html";
}

// Preview avatar
avatarInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  avatarPreview.innerHTML = `<img src="${url}" alt="avatar">`;
});

// Handle form submission
profileForm.addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const country = document.getElementById("country").value.trim();
  const file = avatarInput.files[0];

  let avatar_url = null;

  if (file) {
    const path = `avatars/${userId}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file);
    if (uploadError) {
      console.error(uploadError);
      return alert("Failed to upload profile picture");
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    avatar_url = urlData.publicUrl;
  }

  const { error } = await supabase.from("users").update({
    name,
    email,
    country,
    avatar_url
  }).eq("id", userId);

  if (error) {
    console.error(error);
    return alert("Failed to save profile");
  }

  alert("Profile saved successfully!");
  // Redirect to store
  location.href = "./store/store.html";
});
