// Load profile from localStorage
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileCountry = document.getElementById("profileCountry");
const backBtn = document.getElementById("backBtn");

const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");

if (!profile.name || !profile.email || !profile.country) {
  alert("Profile incomplete. Redirecting to profile setup.");
  location.href = "../profile-setup.html";
} else {
  profileName.textContent = profile.name;
  profileEmail.textContent = profile.email;
  profileCountry.textContent = profile.country;
}

// Back to store
backBtn.addEventListener("click", () => {
  location.href = "./store.html";
});
