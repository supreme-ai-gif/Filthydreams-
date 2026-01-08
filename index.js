import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

// Elements
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

// Toggle forms
showRegister.onclick = (e) => {
  e.preventDefault();
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
};

showLogin.onclick = (e) => {
  e.preventDefault();
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
};

// -------------------- REGISTER --------------------
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  if (!username || !password) return alert("All fields required");

  // Check username
  const { data: exists } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .single();

  if (exists) return alert("Username already taken");

  // Create user
  const { data, error } = await supabase
    .from("users")
    .insert({
      username,
      password,
      profile_completed: false,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return alert("Registration failed");
  }

  // Save userId
  localStorage.setItem("userId", data.id);

  // Go to profile setup
  location.href = "./profile-setup.html";
});

// -------------------- LOGIN --------------------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

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

  if (error || !data) {
    return alert("Invalid login details");
  }

  // Save userId for cart + profile
  localStorage.setItem("userId", data.id);

  // Redirect based on profile status
  if (!data.profile_completed) {
    location.href = "./profile-setup.html";
  } else {
    location.href = "./store/store.html";
  }
});
