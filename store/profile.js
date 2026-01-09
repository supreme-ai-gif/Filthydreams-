// profile.js - display user profile
const userId = localStorage.getItem("userId");
if (!userId) {
  alert("Please login first");
  location.href = "../index.html";
}

// Get profile info from localStorage
const profile = JSON.parse(localStorage.getItem("profile") || "{}");

// Elements
const nameEl = document.getElementById("profileName");
const emailEl = document.getElementById("profileEmail");
const countryEl = document.getElementById("profileCountry");

// Display profile
if (profile.name) nameEl.textContent = profile.name;
if (profile.email) emailEl.textContent = profile.email;
if (profile.country) countryEl.textContent = profile.country;

// Back button
const backBtn = document.getElementById("backBtn");
backBtn.addEventListener("click", () => {
  location.href = "./store.html";
});
