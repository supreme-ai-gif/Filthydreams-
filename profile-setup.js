import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");
const profileForm = document.getElementById("profileForm");

let uploadedAvatarUrl = null;

// Preview image on selection
avatarInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  avatarPreview.src = URL.createObjectURL(file);
});

// Load current user info if exists
const userId = localStorage.getItem("userId");
if (!userId) {
  alert("Not logged in");
  location.href = "./index.html";
}

// Submit profile
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const country = document.getElementById("country").value.trim();

  // Upload avatar if selected
  const file = avatarInput.files[0];
  if (file) {
    const path = `avatars/${userId}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("user-avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error(uploadError);
      return alert("Failed to upload avatar");
    }

    const { data: { publicUrl } } = supabase.storage
      .from("user-avatars")
      .getPublicUrl(path);

    uploadedAvatarUrl = publicUrl;
  }

  // Update users table
  const { error } = await supabase
    .from("users")
    .update({
      username: name,
      email,
      country,
      avatar_url: uploadedAvatarUrl
    })
    .eq("id", userId);

  if (error) {
    console.error(error);
    return alert("Failed to save profile");
  }

  alert("Profile saved successfully!");
  // Redirect to store
  location.href = "./store/store.html";
});
