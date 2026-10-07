const grid = document.querySelector("#manga-grid");
const sortButtons = document.querySelectorAll("[data-sort]");
const randomButton = document.querySelector("#random-work");

const hoverColors = [...new Set(
  (typeof siteHoverColors !== "undefined" && Array.isArray(siteHoverColors)
    ? siteHoverColors : ["#4ccb9a", "#39c5bb", "#45b8d8", "#5c7cfa", "#8b5cf6", "#c65ae8"])
    .filter(color => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color))
    .map(color => color.toLowerCase())
)];
if (!hoverColors.length) hoverColors.push("#39c5bb");

function getFormat(manga) {
  return manga && manga.format === "png" ? "png" : "jpg";
}

async function countPages(manga) {
  return Number.isInteger(manga.pageCount) ? manga.pageCount : (manga.pages || []).length;
}

function dateValue(dateString) {
  return new Date(dateString.replaceAll("/", "-")).getTime();
}

function getSeries(seriesSlug) {
  return seriesList.find((series) => series.slug === seriesSlug);
}

function setRandomHoverColor(card) {
  const currentColor = card.style.getPropertyValue("--hover-color").trim().toLowerCase();
  const alternatives = hoverColors.filter(color => color !== currentColor);
  const choices = alternatives.length ? alternatives : hoverColors;
  card.style.setProperty("--hover-color", choices[Math.floor(Math.random() * choices.length)]);
}

function createCard(manga) {
  const card = document.createElement("article");
  card.className = "manga-card";

  const thumbLink = document.createElement("a");
  thumbLink.className = "thumb-wrap";
  thumbLink.href = `reader.html?work=${encodeURIComponent(manga.slug)}`;

  const image = document.createElement("img");
  image.src = `manga/${manga.slug}/000.${getFormat(manga)}`;
  image.alt = manga.title;
  image.loading = "lazy";
  thumbLink.appendChild(image);

  const info = document.createElement("div");
  info.className = "manga-info";

  const titleLink = document.createElement("a");
  titleLink.className = "manga-title-link";
  titleLink.href = `reader.html?work=${encodeURIComponent(manga.slug)}`;

  const title = document.createElement("h2");
  title.textContent = manga.title;
  titleLink.appendChild(title);
  info.appendChild(titleLink);

  if (manga.type === "episode" && manga.seriesSlug) {
    const series = getSeries(manga.seriesSlug);
    if (series) {
      const seriesLine = document.createElement("div");
      seriesLine.className = "series-line";

      const seriesLink = document.createElement("a");
      seriesLink.className = "series-link";
      seriesLink.href = `series.html?series=${encodeURIComponent(series.slug)}`;
      seriesLink.textContent = series.title;

      const episode = document.createElement("span");
      episode.className = "episode-number";
      episode.textContent = `第${manga.episode}話`;

      seriesLine.append(seriesLink, episode);
      info.appendChild(seriesLine);
    }
  }

  const meta = document.createElement("div");
  meta.className = "manga-meta-row";

  const date = document.createElement("time");
  date.className = "manga-date";
  date.dateTime = manga.date.replaceAll("/", "-");
  date.textContent = manga.date;

  const pageCount = document.createElement("span");
  pageCount.className = "page-count";
  pageCount.textContent = "… PAGES";

  meta.append(date, pageCount);
  info.appendChild(meta);

  card.append(thumbLink, info);
  card.addEventListener("mouseenter", () => setRandomHoverColor(card));

  countPages(manga).then((count) => {
    pageCount.textContent = `${count} ${count === 1 ? "PAGE" : "PAGES"}`;
  });

  return card;
}

function renderWorks(order = "new") {
  const works = [...mangas].sort((a, b) => {
    return order === "old"
      ? dateValue(a.date) - dateValue(b.date)
      : dateValue(b.date) - dateValue(a.date);
  });

  grid.replaceChildren(...works.map(createCard));
}

sortButtons.forEach((button) => {
  button.addEventListener("click", () => {
    sortButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    renderWorks(button.dataset.sort);
  });
});

randomButton.addEventListener("click", () => {
  if (!mangas.length) return;
  const manga = mangas[Math.floor(Math.random() * mangas.length)];
  window.location.href = `reader.html?work=${encodeURIComponent(manga.slug)}`;
});

renderWorks("new");
