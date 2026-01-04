import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(window.__ENV__.SUPABASE_URL, window.__ENV__.SUPABASE_ANON_KEY);

document.getElementById("loginBtn").onclick = async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) return alert("Fill all fields");

  // Check if admin
  if (username === "admin" && password === "1234") {
    localStorage.setItem("isAdmin", "true");
    location.href = "admin.html";
    return;
  }

  // Check user
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password);

  if (error) return alert(error.message);
  if (!users || users.length === 0) return alert("Invalid login");

  localStorage.setItem("user", JSON.stringify(users[0]));
  location.href = "store.html";
};
