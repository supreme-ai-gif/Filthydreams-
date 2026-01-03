import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

export async function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const { error } = await supabase
    .from("users")
    .insert([{ username, password }]);

  if (error) return alert("Username already exists");
  alert("Registered! Login now");
  window.location.href = "login.html";
}
