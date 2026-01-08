import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const userId = localStorage.getItem("userId");

if (!userId) {
  alert("Not logged in");
  location.href = "./index.html";
}

const form = document.getElementById("profileForm");

form.addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const country = document.getElementById("country").value.trim();
  const avatarFile = document.getElementById("avatar").files[0];

  if (!name || !email || !country) {
    alert("Fill all required fields");
    return;
  }

  let avatarUrl = null;

  // 📸 UPLOAD AVATAR IF EXISTS
  if (avatarFile) {
    const path = `avatars/${userId}-${Date.now()}`;

    const { error: uploadError } = await supabase
      .storage
      .from("avatars")
      .upload(path, avatarFile);

    if (uploadError) {
      console.error(uploadError);
      alert("Failed to upload profile picture");
      return;
    }

    avatarUrl = supabase
      .storage
      .from("avatars")
      .getPublicUrl(path).data.publicUrl;
  }

  // 💾 SAVE PROFILE
  const { error } = await supabase
    .from("users")
    .update({
      name,
      email,
      country,
      avatar_url: avatarUrl
    })
    .eq("id", userId);

  if (error) {
    console.error(error);
    alert("Failed to save profile");
    return;
  }

  location.href = "./store/store.html";
});
