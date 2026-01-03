import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const registerBtn = document.getElementById("registerBtn");
registerBtn.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) return alert("Enter username and password");

  const { error } = await supabase.from("users").insert([{ username, password }]);

  if (error) return alert("Username already exists or failed: " + error.message);

  alert("Registered successfully! Redirecting to login...");
  window.location.href = "login.html";
});
