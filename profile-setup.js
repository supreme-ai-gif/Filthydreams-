const form = document.getElementById("profileForm");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const countryInput = document.getElementById("country");

// Must be logged in
const userId = localStorage.getItem("userId");
if (!userId) {
  alert("Not logged in");
  location.href = "./index.html";
}

// Prefill if exists
const existingProfile = JSON.parse(localStorage.getItem("userProfile"));
if (existingProfile) {
  usernameInput.value = existingProfile.username || "";
  emailInput.value = existingProfile.email || "";
  countryInput.value = existingProfile.country || "";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const profile = {
    userId,
    username: usernameInput.value.trim(),
    email: emailInput.value.trim(),
    country: countryInput.value.trim(),
    completed: true
  };

  if (!profile.username || !profile.email || !profile.country) {
    alert("Please fill all fields");
    return;
  }

  // SAVE PROFILE
  localStorage.setItem("userProfile", JSON.stringify(profile));

  alert("Profile saved successfully!");

  // IMPORTANT: GO TO STORE (NO LOOP)
  location.replace("./store/store.html");
});
