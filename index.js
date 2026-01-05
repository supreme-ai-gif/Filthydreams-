import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = window.__ENV__.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV__.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Forms
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

// --- TOGGLE LOGIN / REGISTER ---
showRegister.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
});

showLogin.addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
});

// --- REGISTER LOGIC ---
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  // Check username exists
  const { data: existing } = await supabase.from("users").select("*").eq("username", username);
  if (existing.length) return alert("Username already taken");

  const { error } = await supabase.from("users").insert({ username, password, role: "user" });
  if (error) return alert("Error registering");

  alert("Registered successfully! Please login.");
  registerForm.reset();
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
});

// --- LOGIN LOGIC ---
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  // ADMIN CHECK
  if (username === "admin" && password === "1234") {
    localStorage.setItem("isAdmin", "true");
    location.href = "./admin/admin.html";
    return;
  }

  // USER CHECK
  const { data, error } = await supabase.from("users").select("*").eq("username", username).eq("password", password);

  if (error) return alert("Error logging in");
  if (!data || data.length === 0) return alert("Invalid credentials");

  const user = data[0];
  localStorage.setItem("userProfile", JSON.stringify({
    name: user.username,
    email: user.email || "",
    avatar: user.avatar_url || ""
  }));

  location.href = "./store/store.html";
});
