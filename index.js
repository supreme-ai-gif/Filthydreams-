import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

/* TOGGLE */
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

/* REGISTER */
registerForm.onsubmit = async e => {
  e.preventDefault();

  const username = registerForm.registerUsername.value.trim();
  const password = registerForm.registerPassword.value.trim();

  const { data: exists } = await supabase
    .from("users")
    .select("id")
    .eq("username", username);

  if (exists.length) return alert("Username already exists");

  const { data, error } = await supabase
    .from("users")
    .insert({ username, password })
    .select()
    .single();

  if (error) {
    console.error(error);
    return alert("Registration failed");
  }

  localStorage.setItem("userId", data.id);
  location.href = "./profile-setup.html";
};

/* LOGIN */
loginForm.onsubmit = async e => {
  e.preventDefault();

  const username = loginForm.loginUsername.value.trim();
  const password = loginForm.loginPassword.value.trim();

  // Admin
  if (username === "admin" && password === "1234") {
    location.href = "./admin/admin.html";
    return;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data) return alert("Invalid login");

  localStorage.setItem("userId", data.id);

  if (!data.name || !data.email || !data.country) {
    location.href = "./profile-setup.html";
  } else {
    location.href = "./store/store.html";
  }
};
