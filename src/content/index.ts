import "../styles/content.css";

function init() {
  console.log("Ethoscan content script loaded");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
