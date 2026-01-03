import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

export async function saveProfile() {
  const user = JSON.parse(localStorage.getItem("user"));

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const country = document.getElementById("country").value;

  const { error } = await supabase
    .from("users")
    .update({ name, email, country })
    .eq("id", user.id);

  if (error) return alert("Failed to save profile");

  user.name = name;
  user.email = email;
  user.country = country;
  localStorage.setItem("user", JSON.stringify(user));

  window.location.href = "store.html";
    }
