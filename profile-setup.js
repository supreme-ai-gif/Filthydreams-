import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = window.__ENV__.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV__.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const userId = localStorage.getItem("userId");
if (!userId) {
  alert("Not logged in");
  location.href = "../index.html";
}

const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");
const profileForm = document.getElementById("profileForm");
const errorMsg = document.getElementById("errorMsg");

// ===== Avatar Preview =====
avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    avatarPreview.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// ===== Save Profile =====
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const name = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const country = document.getElementById("country").value.trim();

  if (!name || !email || !country) {
    errorMsg.textContent = "All fields are required";
    return;
  }

  let avatarUrl = null;

  // Upload avatar if selected
  if (avatarInput.files[0]) {
    const file = avatarInput.files[0];
    const path = `${userId}-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("user-avatars")
      .upload(path, file, { cacheControl: "3600", upsert: true });

    if (uploadError) {
      console.error(uploadError);
      errorMsg.textContent = "Failed to upload avatar";
      return;
    }

    const { data } = supabase.storage.from("user-avatars").getPublicUrl(path);
    avatarUrl = data.publicUrl;
  }

  // Update user profile in Supabase
  const { error } = await supabase
    .from("users")
    .update({
      username: name,
      email,
      country,
      avatar_url: avatarUrl
    })
    .eq("id", userId);

  if (error) {
    console.error(error);
    errorMsg.textContent = "Failed to save profile";
    return;
  }

  // Save to localStorage
  localStorage.setItem("userProfile", JSON.stringify({
    name,
    email,
    country,
    avatar: avatarUrl || ""
  }));

  alert("Profile saved successfully!");
  location.href = "../store/store.html"; // redirect to store
});
