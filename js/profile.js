import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const saveBtn = document.getElementById("saveProfileBtn");
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");

saveBtn.addEventListener("click", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("Login first");

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const country = document.getElementById("country").value.trim();

  if (!name || !email || !country) return alert("Fill in all fields");

  let image_url = user.avatar_url || null;

  // If user uploaded a new picture
  if (avatarInput.files.length > 0) {
    const file = avatarInput.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data, error: uploadError } = await supabase.storage
      .from("avatars")   // Make sure you created a bucket named 'avatars'
      .upload(filePath, file, { cacheControl: "3600", upsert: true });

    if (uploadError) return alert("Failed to upload avatar: " + uploadError.message);

    const { publicURL } = supabase.storage.from("avatars").getPublicUrl(filePath);
    image_url = publicURL;
  }

  // Update users table
  const { error } = await supabase
    .from("users")
    .update({ name, email, country, avatar_url: image_url })
    .eq("id", user.id);

  if (error) return alert("Failed to save profile: " + error.message);

  // Update local storage
  user.name = name;
  user.email = email;
  user.country = country;
  user.avatar_url = image_url;
  localStorage.setItem("user", JSON.stringify(user));

  alert("Profile saved successfully!");
  window.location.href = "store.html";
});
