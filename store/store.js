console.log("STORE JS LOADED");

const productsContainer = document.getElementById("productsContainer");

productsContainer.innerHTML = `
  <div class="product-card" style="padding:40px;background:white;cursor:pointer">
    CLICK ME TEST PRODUCT
  </div>
`;

document.querySelector(".product-card").addEventListener("click", () => {
  console.log("PRODUCT CLICKED");
  window.location.href = "./product.html?id=1";
});
