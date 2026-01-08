import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = window.__ENV__.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV__.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elements
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

// Toggle forms
showRegister.onclick = e => {
  e.preventDefault();
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
};
showLogin.onclick = e => {
  e.preventDefault();
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
};

/* =====================
   REGISTER
===================== */
registerForm.addEventListener("submit", async e => {
  e.preventDefault();
  const username = registerForm.registerUsername.value.trim();
  const password = registerForm.registerPassword.value.trim();

  // Check existing user
  const { data: exists, error: checkErr } = await supabase
    .from("users")
    .select("id")
    .eq("username", username);

  if (checkErr) { alert("Database error"); return; }
  if (exists.length > 0) { alert("Username already exists"); return; }

  // Insert new user
  const { data, error } = await supabase
    .from("users")
    .insert({ username, password, email: null, country: null })
    .select()
    .single();

  if (error) { console.error(error); alert("Registration failed"); return; }

  // Save session
  localStorage.setItem("userId", data.id);
  localStorage.setItem("username", data.username);

  // Go to profile setup
  location.href = "./profile-setup.html";
});

/* =====================
   LOGIN
===================== */
loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  const username = loginForm.loginUsername.value.trim();
  const password = loginForm.loginPassword.value.trim();

  // Admin shortcut
  if (username === "admin" && password === "1234") {
    localStorage.setItem("isAdmin", "true");
    location.href = "./admin/admin.html";
    return;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data) { alert("Invalid login"); return; }

  // Save session
  localStorage.setItem("userId", data.id);
  localStorage.setItem("username", data.username);

  // Check profile
  if (!data.email || !data.country) {
    location.href = "./profile-setup.html";
  } else {
    location.href = "./store/store.html";
  }
});
