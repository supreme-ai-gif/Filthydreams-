async function saveProfile() {
  const user = JSON.parse(localStorage.getItem("user"));

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const country = document.getElementById("country").value;

  const { error } = await supabase
    .from("users")
    .update({ name, email, country })
    .eq("id", user.id);

  if (error) {
    alert("Failed to save profile");
    return;
  }

  // Update local storage
  user.name = name;
  user.email = email;
  user.country = country;
  localStorage.setItem("user", JSON.stringify(user));

  window.location.href = "store.html";
}
