const siteName = typeof siteConfig !== "undefined" ? siteConfig.name : "マンガ置き場";
const params = new URLSearchParams(window.location.search);
const slug = params.get("work");
const manga = mangas.find(item => item.slug === slug);

const titleEl = document.querySelector("#reader-title");
const dateEl = document.querySelector("#reader-date");
const comic = document.querySelector("#comic");
const pageCountEl = document.querySelector("#reader-page-count");
const seriesLinkEls = [
  document.querySelector("#reader-series-link"),
  document.querySelector("#reader-series-link-bottom")
].filter(Boolean);

function getFormat(manga) {
  return manga && manga.format === "png" ? "png" : "jpg";
}

if (!manga) {
  titleEl.textContent = "作品が見つかりません";
  dateEl.remove();
  pageCountEl.remove();
  seriesLinkEls.forEach((link) => {
    link.hidden = true;
  });
  comic.innerHTML = '<p class="reader-message">トップページから作品を選び直してください。</p>';
} else {
  const format = getFormat(manga);

  document.title = `${manga.title} | ${siteName}`;
  titleEl.textContent = manga.title;
  dateEl.dateTime = manga.date.replaceAll("/", "-");
  dateEl.textContent = manga.date;

  if (manga.type === "episode" && manga.seriesSlug) {
    const series = seriesList.find((item) => item.slug === manga.seriesSlug);
    if (series) {
      seriesLinkEls.forEach((link) => {
        link.href = `series.html?series=${encodeURIComponent(series.slug)}`;
        link.textContent = `← ${series.title} のシリーズページへ`;
        link.hidden = false;
      });
    }
  }

  const pages = Array.isArray(manga.pages) ? manga.pages : [];
  pageCountEl.textContent = `${pages.length} ${pages.length === 1 ? "PAGE" : "PAGES"}`;
  if (!pages.length) {
    comic.textContent = "ページ情報がありません。アプリからサイト一式を再度書き出してください。";
  } else {
    const slots = pages.map((size, index) => {
      const slot = document.createElement("div");
      slot.className = "comic-page";
      slot.style.aspectRatio = `${size.width} / ${size.height}`;
      slot.dataset.page = String(index + 1);
      slot.setAttribute("aria-label", `${manga.title} ${index + 1}ページ目`);
      comic.appendChild(slot);
      return slot;
    });
    function release(slot) {
      const img = slot.querySelector("img");
      if (img) { img.onload = null; img.onerror = null; img.removeAttribute("src"); }
      slot.replaceChildren();
    }
    function mount(slot) {
      if (slot.childElementCount) return;
      const img = new Image();
      img.alt = `${manga.title} ${slot.dataset.page}ページ目`;
      img.decoding = "async";
      img.onerror = () => {
        if (!slot.contains(img)) return;
        const retry = document.createElement("button");
        retry.className = "page-retry";
        retry.textContent = `${slot.dataset.page}ページ目を再読み込み`;
        retry.onclick = () => { release(slot); mount(slot); };
        slot.replaceChildren(retry);
      };
      slot.appendChild(img);
      img.src = `manga/${manga.slug}/${slot.dataset.page.padStart(3, "0")}.${format}`;
    }
    if (typeof IntersectionObserver !== "undefined") {
      // Keep roughly one screen of pages above and below the viewport.
      let observer;
      function observe() {
        if (observer) observer.disconnect();
        const margin = Math.max(400, window.innerHeight);
        observer = new IntersectionObserver(entries => {
          entries.forEach(entry => entry.isIntersecting ? mount(entry.target) : release(entry.target));
        }, { rootMargin: `${margin}px 0px`, threshold: 0 });
        slots.forEach(slot => observer.observe(slot));
      }
      observe();
      let resizeFrame;
      window.addEventListener("resize", () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(observe);
      });
    } else {
      // Fallback also limits decoded pages; never load the entire work at once.
      let pending = false;
      function update() {
        pending = false;
        const height = window.innerHeight;
        slots.forEach(slot => {
          const rect = slot.getBoundingClientRect();
          if (rect.bottom >= -height && rect.top <= 2 * height) mount(slot);
          else release(slot);
        });
      }
      function schedule() { if (!pending) { pending = true; requestAnimationFrame(update); } }
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      update();
    }
  }
}

// Local previews must not share a private file:// path.
const shareX = document.querySelector("#share-x");
if (shareX && manga) {
  shareX.hidden = false;
  if (/^https?:$/.test(window.location.protocol)) {
    const pageURL = new URL(window.location.href);
    pageURL.hash = "";
    pageURL.search = new URLSearchParams({work: manga.slug}).toString();
    const intent = new URL("https://x.com/intent/tweet");
    intent.search = new URLSearchParams({text: `${manga.title} | ${siteName}`, url: pageURL.href}).toString();
    shareX.href = intent.href;
    shareX.setAttribute("aria-label", "Xで共有（新しいタブで開く）");
  } else {
    shareX.setAttribute("aria-disabled", "true");
    shareX.title = "サイト公開後に共有できます";
  }
}
