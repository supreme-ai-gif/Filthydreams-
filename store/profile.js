const backBtn = document.getElementById("backBtn");
const logoutBtn = document.getElementById("logoutBtn");

const usernameEl = document.getElementById("username");
const emailEl = document.getElementById("email");
const countryEl = document.getElementById("country");

// Must be logged in
const profile = JSON.parse(localStorage.getItem("userProfile"));
const userId = localStorage.getItem("userId");

if (!profile || !userId) {
  location.href = "../index.html";
}

// Fill UI
usernameEl.textContent = profile.username;
emailEl.textContent = profile.email;
countryEl.textContent = profile.country;

// Back to store
backBtn.onclick = () => {
  location.href = "./store.html";
};

// Logout
logoutBtn.onclick = () => {
  localStorage.clear();
  location.href = "../index.html";
};
