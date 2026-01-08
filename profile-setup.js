// Elements
const profileForm = document.getElementById("profileForm");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const countryInput = document.getElementById("country");

// Prefill if localStorage already has data
const savedProfile = JSON.parse(localStorage.getItem("userProfile"));
if (savedProfile) {
  if (savedProfile.username) usernameInput.value = savedProfile.username;
  if (savedProfile.email) emailInput.value = savedProfile.email;
  if (savedProfile.country) countryInput.value = savedProfile.country;
}

// On submit
profileForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const profileData = {
    username: usernameInput.value.trim(),
    email: emailInput.value.trim(),
    country: countryInput.value.trim(),
  };

  if (!profileData.username || !profileData.email || !profileData.country) {
    return alert("Please fill all fields!");
  }

  // Save to localStorage
  localStorage.setItem("userProfile", JSON.stringify(profileData));

  alert("Profile saved successfully!");

  // Redirect to store
  location.href = "./store/store.html";
});
