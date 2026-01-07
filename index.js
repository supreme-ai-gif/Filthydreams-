import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = window.__ENV__.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV__.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Forms
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

// Toggle forms
showRegister.addEventListener("click", e => {
  e.preventDefault();
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
});
showLogin.addEventListener("click", e => {
  e.preventDefault();
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
});

// -------- REGISTER --------
registerForm.addEventListener("submit", async e => {
  e.preventDefault();
  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  if (!username || !password) return alert("Enter username and password");

  // Check if username exists
  const { data: existing } = await supabase.from("users").select("id").eq("username", username).single();
  if (existing) return alert("Username already taken");

  // Insert new user
  const { data, error } = await supabase.from("users").insert({ username, password, role: "user" }).select().single();
  if (error || !data) return alert("Error registering");

  // Save userId in localStorage
  localStorage.setItem("userId", data.id);
  localStorage.setItem("username", data.username);

  // Redirect to profile setup page
  location.href = "./profile-setup.html";
});

// -------- LOGIN --------
loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!username || !password) return alert("Enter username and password");

  // Admin check
  if (username === "admin" && password === "1234") {
    localStorage.setItem("isAdmin", "true");
    location.href = "./admin/admin.html";
    return;
  }

  // User check
  const { data, error } = await supabase.from("users").select("*").eq("username", username).eq("password", password).single();
  if (error || !data) return alert("Invalid credentials");

  // Save user info for cart/profile
  localStorage.setItem("userId", data.id);
  localStorage.setItem("username", data.username);
  localStorage.setItem("email", data.email || "");
  localStorage.setItem("avatar", data.avatar_url || "");

  // If profile not complete (no email or avatar), go to profile setup
  if (!data.email || !data.avatar_url) {
    location.href = "./profile-setup.html";
  } else {
    location.href = "./store/store.html";
  }
});
