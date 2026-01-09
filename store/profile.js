// Elements
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileCountry = document.getElementById("profileCountry");
const backBtn = document.getElementById("backBtn");

// Load profile from localStorage
const profileJSON = localStorage.getItem("userProfile");

if (profileJSON) {
  const profile = JSON.parse(profileJSON);

  // Display values with fallback
  profileName.textContent = profile.name || "Not provided";
  profileEmail.textContent = profile.email || "Not provided";
  profileCountry.textContent = profile.country || "Not provided";
} else {
  // If nothing is in localStorage, just show default text
  profileName.textContent = "Not provided";
  profileEmail.textContent = "Not provided";
  profileCountry.textContent = "Not provided";
}

// Back button
backBtn.addEventListener("click", () => {
  location.href = "./store.html";
});
