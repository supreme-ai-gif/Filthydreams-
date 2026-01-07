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

// --- AUTO REDIRECT IF LOGGED IN ---
window.addEventListener("DOMContentLoaded", async () => {
  const loggedUser = localStorage.getItem("userId");
  const isAdmin = localStorage.getItem("isAdmin");

  if (isAdmin === "true") {
    location.href = "./admin/admin.html";
    return;
  }

  if (loggedUser) {
    // Fetch user to check profile completion
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", loggedUser)
      .single();
    if (data) {
      if (!data.email || !data.avatar_url) {
        location.href = "./profile-setup.html";
      } else {
        localStorage.setItem("userProfile", JSON.stringify({
          name: data.username,
          email: data.email,
          avatar: data.avatar_url
        }));
        location.href = "./store/store.html";
      }
    } else {
      localStorage.removeItem("userId");
    }
  }
});

// --- REGISTER LOGIC ---
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  if (!username || !password) return alert("Enter all fields");

  // Check if username exists
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("username", username);

  if (existing.length) return alert("Username already taken");

  const { data, error } = await supabase
    .from("users")
    .insert({ username, password, role: "user" })
    .select()
    .single();

  if (error || !data) return alert("Error registering");

  alert("Registered successfully! Please setup your profile.");
  // Save userId for profile setup
  localStorage.setItem("userId", data.id);
  location.href = "./profile-setup.html";
});

// --- LOGIN LOGIC ---
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!username || !password) return alert("Enter all fields");

  // ADMIN CHECK
  if (username === "admin" && password === "1234") {
    localStorage.setItem("isAdmin", "true");
    location.href = "./admin/admin.html";
    return;
  }

  // USER CHECK
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data) return alert("Invalid credentials");

  const user = data;

  // Check profile completion
  if (!user.email || !user.avatar_url) {
    localStorage.setItem("userId", user.id);
    location.href = "./profile-setup.html";
  } else {
    // Save user profile
    localStorage.setItem("userId", user.id);
    localStorage.setItem("userProfile", JSON.stringify({
      name: user.username,
      email: user.email,
      avatar: user.avatar_url
    }));
    location.href = "./store/store.html";
  }
});
