const supabase = supabase.createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // 🟥 ADMIN LOGIN CHECK (FIRST)
  if (username === "admin" && password === "1234") {
    localStorage.setItem("isAdmin", "true");
    window.location.href = "admin/admin.html";
    return;
  }

  // 🟩 NORMAL USER LOGIN
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data) {
    alert("Invalid username or password");
    return;
  }

  localStorage.setItem("user", JSON.stringify(data));
  localStorage.removeItem("isAdmin");

  // 🔍 PROFILE CHECK
  if (!data.name || !data.email || !data.country) {
    window.location.href = "profile.html";
  } else {
    window.location.href = "store.html";
  }
}
