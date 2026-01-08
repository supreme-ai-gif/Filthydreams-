const form = document.getElementById("profileForm");

form.addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const country = document.getElementById("country").value.trim();

  if (!name || !email || !country) return alert("All fields are required");

  // Save profile to a local file (simulate profile.txt)
  const content = `Name: ${name}\nEmail: ${email}\nCountry: ${country}`;
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "profile.txt";
  a.click();
  URL.revokeObjectURL(a.href);

  // Save info in localStorage
  localStorage.setItem("profileName", name);
  localStorage.setItem("profileEmail", email);
  localStorage.setItem("profileCountry", country);

  alert("Profile saved!");
  location.href = "./store/store.html";
});
