import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

// Elements
const profileForm = document.getElementById("profileForm");
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");

// Preview avatar
avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) return;
  avatarPreview.src = URL.createObjectURL(file);
});

// Submit profile
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userId = localStorage.getItem("userId");
  if (!userId) return alert("Not logged in");

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const country = document.getElementById("country").value.trim();

  let avatarUrl = null;

  // Upload avatar if selected
  if (avatarInput.files[0]) {
    const file = avatarInput.files[0];
    const path = `avatars/${userId}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file);

    if (uploadError) {
      console.error(uploadError);
      return alert("Failed to upload avatar");
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    avatarUrl = publicUrl;
  }

  // Update user
  const { error } = await supabase
    .from("users")
    .update({ name, email, country, avatar_url: avatarUrl })
    .eq("id", userId);

  if (error) {
    console.error(error);
    return alert("Failed to save profile");
  }

  alert("Profile saved successfully!");

  // Redirect to store
  location.href = "./store/store.html";
});
