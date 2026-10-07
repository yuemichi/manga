const siteName = typeof siteConfig !== "undefined" ? siteConfig.name : "マンガ置き場";
const params = new URLSearchParams(window.location.search);
const seriesSlug = params.get("series");
const series = seriesList.find((item) => item.slug === seriesSlug);

const titleEl = document.querySelector("#series-title");
const grid = document.querySelector("#series-grid");

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

function setRandomHoverColor(card) {
  const currentColor = card.style.getPropertyValue("--hover-color").trim().toLowerCase();
  const alternatives = hoverColors.filter(color => color !== currentColor);
  const choices = alternatives.length ? alternatives : hoverColors;
  card.style.setProperty("--hover-color", choices[Math.floor(Math.random() * choices.length)]);
}

function createEpisodeCard(manga) {
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

  const episodeLine = document.createElement("div");
  episodeLine.className = "series-line";
  episodeLine.innerHTML = `<span class="episode-number">第${manga.episode}話</span>`;

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
  info.append(titleLink, episodeLine, meta);
  card.append(thumbLink, info);

  card.addEventListener("mouseenter", () => setRandomHoverColor(card));

  countPages(manga).then((count) => {
    pageCount.textContent = `${count} ${count === 1 ? "PAGE" : "PAGES"}`;
  });

  return card;
}

if (!series) {
  document.title = `シリーズが見つかりません | ${siteName}`;
  titleEl.textContent = "シリーズが見つかりません";
} else {
  document.title = `${series.title} | ${siteName}`;
  titleEl.textContent = series.title;

  const episodes = mangas
    .filter((manga) => manga.type === "episode" && manga.seriesSlug === series.slug)
    .sort((a, b) => Number(a.episode) - Number(b.episode));

  grid.replaceChildren(...episodes.map(createEpisodeCard));
}
