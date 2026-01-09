// Get userId from localStorage (set during registration/login)
const userId = localStorage.getItem("userId");
if (!userId) {
  alert("Please login first");
  location.href = "../index.html"; // redirect if not logged in
}

// Form elements
const form = document.getElementById("profileForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const countryInput = document.getElementById("country");

// Pre-fill form if profile exists
const savedProfile = JSON.parse(localStorage.getItem("profile") || "{}");
if (savedProfile.name) nameInput.value = savedProfile.name;
if (savedProfile.email) emailInput.value = savedProfile.email;
if (savedProfile.country) countryInput.value = savedProfile.country;

// Save profile on submit
form.addEventListener("submit", e => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const country = countryInput.value.trim();

  if (!name || !email || !country) {
    alert("All fields are required");
    return;
  }

  // Save to localStorage
  localStorage.setItem("profile", JSON.stringify({ name, email, country }));

  alert("Profile saved successfully!");
  location.href = "../store/store.html"; // go to store
});
