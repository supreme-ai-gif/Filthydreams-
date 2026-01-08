import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const avatarPreview = document.getElementById("avatarPreview");
const avatarInput = document.getElementById("avatarInput");
const profileForm = document.getElementById("profileForm");
const emailInput = document.getElementById("email");
const nameInput = document.getElementById("name");
const countryInput = document.getElementById("country");

let avatarFile = null;

// Get current user from Supabase auth
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  alert("Not logged in!");
  location.href = "../index.html";
}

// Avatar select
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

// Submit form
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const name = nameInput.value.trim();
  const country = countryInput.value.trim();
  if (!email || !name || !country) return alert("Fill in all fields");

  let avatarUrl = null;
  if (avatarFile) {
    const path = `avatars/${Date.now()}-${avatarFile.name}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, avatarFile);
    if (uploadError) return alert("Avatar upload failed");

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    avatarUrl = data.publicUrl;
  }

  const { error } = await supabase.from("users").update({
    name,
    email,
    country,
    avatar_url: avatarUrl
  }).eq("id", user.id);

  if (error) return alert("Failed to save profile. Check RLS policy!");

  localStorage.setItem("userProfile", JSON.stringify({
    name,
    email,
    country,
    avatar: avatarUrl || ""
  }));

  alert("Profile saved successfully!");
  location.href = "./store/store.html";
});
