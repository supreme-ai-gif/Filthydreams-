import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = window.__ENV__.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV__.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // check if username exists
  const { data: existing, error: err } = await supabase
    .from("users")
    .select("*")
    .eq("username", username);

  if (err) return alert("Error checking username");
  if (existing.length) return alert("Username already taken");

  // insert user
  const { error } = await supabase
    .from("users")
    .insert({ username, password, role: "user" });

  if (error) return alert("Error registering");
  alert("Registered! Please login.");
  location.href = "./login.html";
});
