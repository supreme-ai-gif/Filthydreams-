import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

export async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // Admin check
  if (username === "admin" && password === "1234") {
    localStorage.setItem("isAdmin", "true");
    window.location.href = "admin/admin.html";
    return;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data) return alert("Invalid username or password");

  localStorage.setItem("user", JSON.stringify(data));
  localStorage.removeItem("isAdmin");

  if (!data.name || !data.email || !data.country) {
    window.location.href = "profile.html";
  } else {
    window.location.href = "store.html";
  }
}
