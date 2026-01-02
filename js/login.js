const supabase = supabase.createClient(
  window.__ENV__.SUPABASE_URL,
  window.__ENV__.SUPABASE_ANON_KEY
);

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data) {
    alert("Invalid login");
    return;
  }

  // Save user session
  localStorage.setItem("user", JSON.stringify(data));

  // 🔴 PROFILE CHECK
  if (!data.name || !data.email || !data.country) {
    window.location.href = "profile.html"; // setup page
  } else {
    window.location.href = "store.html"; // main store
  }
}
