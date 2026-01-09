// Elements
const setupForm = document.getElementById("profileSetupForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const countryInput = document.getElementById("country");

// Load existing profile if any
const existingProfile = localStorage.getItem("userProfile");
if (existingProfile) {
  const profile = JSON.parse(existingProfile);
  nameInput.value = profile.name || "";
  emailInput.value = profile.email || "";
  countryInput.value = profile.country || "";
}

// Save profile on submit
setupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const profile = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    country: countryInput.value.trim()
  };

  // Save to localStorage
  localStorage.setItem("userProfile", JSON.stringify(profile));

  alert("Profile saved successfully!");

  // Redirect to store only once
  location.href = "../store/store.html";
});
