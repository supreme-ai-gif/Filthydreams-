const menuBtn = document.getElementById("menuBtn");
const closeMenu = document.getElementById("closeMenu");
const sideMenu = document.getElementById("sideMenu");

menuBtn.onclick = () => sideMenu.classList.add("show");
closeMenu.onclick = () => sideMenu.classList.remove("show");
