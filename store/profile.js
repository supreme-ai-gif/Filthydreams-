// Elements
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileCountry = document.getElementById("profileCountry");
const backBtn = document.getElementById("backBtn");

// Load profile from localStorage
const profileJSON = localStorage.getItem("userProfile");
if (!profileJSON) {
  // No profile at all → redirect to setup
  alert("No profile found. Redirecting to profile setup.");
  location.href = "../profile-setup.html";
} else {
  const profile = JSON.parse(profileJSON);

  // Display values (use fallback text if missing)
  profileName.textContent = profile.name || "Not provided";
  profileEmail.textContent = profile.email || "Not provided";
  profileCountry.textContent = profile.country || "Not provided";
}

// Back to store
backBtn.addEventListener("click", () => {
  location.href = "./store.html";
});
