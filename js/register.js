import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(window.__ENV__.SUPABASE_URL, window.__ENV__.SUPABASE_ANON_KEY);

document.getElementById("registerBtn").onclick = async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) return alert("Fill all fields");

  const { error } = await supabase.from("users").insert([{ username, password }]);

  if (error) return alert(error.message);
  alert("Registered! Go to login.");
  location.href = "login.html";
};
