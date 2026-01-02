import { supabase } from "./supabase.js";

registerBtn?.addEventListener("click", async () => {
  await supabase.from("users").insert({
    username: username.value,
    password: password.value
  });
  location.href = "login.html";
});

loginBtn?.addEventListener("click", async () => {
  if (username.value === "admin" && password.value === "1234") {
    location.href = "admin.html";
    return;
  }

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("username", username.value)
    .eq("password", password.value)
    .single();

  if (data) {
    localStorage.setItem("user", data.id);
    location.href = "profile-setup.html";
  }
});
