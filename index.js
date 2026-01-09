import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

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

/* =====================
   REGISTER
===================== */
registerForm.addEventListener("submit", async e => {
  e.preventDefault();

  const username = registerForm.registerUsername.value.trim();
  const password = registerForm.registerPassword.value.trim();

  // Check existing user
  const { data: exists } = await supabase
    .from("users")
    .select("id")
    .eq("username", username);

  if (exists.length > 0) return alert("Username already exists");

  // Insert new user
  const { data, error } = await supabase
    .from("users")
    .insert({
      username,
      password,
      email: null,
      country: null
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return alert("Registration failed");
  }

  // Save session
  localStorage.setItem("userId", data.id);
  localStorage.setItem("username", data.username);

  // NEW USER → go to profile setup
  location.href = "./profile-setup.html";
});

/* =====================
   LOGIN
===================== */
loginForm.addEventListener("submit", async e => {
  e.preventDefault();

  const username = loginForm.loginUsername.value.trim();
  const password = loginForm.loginPassword.value.trim();

  // ADMIN shortcut
  if (username === "admin" && password === "1234") {
    localStorage.setItem("isAdmin", "true");
    location.href = "./admin/admin.html";
    return;
  }

  // Fetch user
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data) return alert("Invalid login");

  // Save session
  localStorage.setItem("userId", data.id);
  localStorage.setItem("username", data.username);

  // EXISTING USER → go to store directly
  location.href = "./store/store.html";
});
