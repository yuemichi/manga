const STAR_COUNT = 52;
const starField = document.querySelector("#star-field");

if (starField) {
  for (let i = 0; i < STAR_COUNT; i++) {
    const star = document.createElement("div");
    star.className = "pixel-star";

    star.style.left = Math.random() * 100 + "vw";
    star.style.top = Math.random() * 100 + "vh";

    const speed = 3 + Math.random() * 5;
    star.style.setProperty("--speed", speed + "s");
    star.style.setProperty("--delay", (-Math.random() * speed) + "s");

    const size = Math.random() < 0.7 ? 1 : 2;
    star.style.width = size + "px";
    star.style.height = size + "px";

    if (Math.random() < 0.12) {
      star.classList.add("bright");
    }

    starField.appendChild(star);
  }
}
