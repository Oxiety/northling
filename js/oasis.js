(() => {
  "use strict";
  const target = document.getElementById("oasisAlbums");
  const liveTarget = document.getElementById("oasisLiveArchive");
  const bsideTarget = document.getElementById("oasisBSides");
  const deepTarget = document.getElementById("oasisDeepCuts");
  if (!target && !liveTarget && !bsideTarget && !deepTarget) return;
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[ch]));
  const reveal = node => node.querySelectorAll(".rv").forEach(el => el.classList.add("in"));
  fetch("data/oasis.json", { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("Не удалось загрузить данные Oasis");
      return response.json();
    })
    .then(data => {
      if (target) {
        const albums = Array.isArray(data.albums) ? data.albums : [];
        if (!albums.length) {
          target.innerHTML = '<p class="gallery-empty">Альбомы пока не добавлены.</p>';
        } else {
          target.innerHTML = albums.map((album, index) => {
            const tracks = Array.isArray(album.tracks) ? album.tracks : [];
            return `<article class="card album-card rv">
              <div class="album-meta"><span class="n">${String(index + 1).padStart(2, "0")}</span><span class="album-year">${esc(album.year)}</span></div>
              <h3>${esc(album.title)}</h3>
              <p class="album-description">${esc(album.description)}</p>
              <ol class="album-tracks">${tracks.map((track, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span>${esc(track)}</li>`).join("")}</ol>
            </article>`;
          }).join("");
        }
        reveal(target);
      }
      if (liveTarget) {
        const live = Array.isArray(data.live) ? data.live : [];
        liveTarget.innerHTML = live.length ? live.map(item => `<article class="concert-card rv">
          <img src="${esc(item.image)}" alt="${esc(item.alt || item.title)}" loading="lazy">
          <div class="concert-copy"><span class="concert-kicker">${esc(item.location)} · ${esc(item.year)}</span><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></div>
        </article>`).join("") : '<p class="gallery-empty">Концерты пока не добавлены.</p>';
        reveal(liveTarget);
      }
      if (bsideTarget) {
        const sides = Array.isArray(data.b_sides) ? data.b_sides : [];
        bsideTarget.innerHTML = sides.length ? sides.map(item => `<article class="card bside-card rv"><span class="bside-label">${esc(item.era)}</span><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></article>`).join("") : '<p class="gallery-empty">B-sides пока не добавлены.</p>';
        reveal(bsideTarget);
      }
      if (deepTarget) {
        const cuts = Array.isArray(data.deep_cuts) ? data.deep_cuts : [];
        deepTarget.innerHTML = cuts.length ? cuts.map(title => `<span>${esc(title)}</span>`).join("") : '<p class="gallery-empty">Песни пока не добавлены.</p>';
      }
    })
    .catch(error => {
      [target, liveTarget, bsideTarget, deepTarget].filter(Boolean).forEach(node => {
        node.innerHTML = '<p class="gallery-empty">Не получилось загрузить данные Oasis. Проверь data/oasis.json.</p>';
      });
      console.error(error);
    });
})();
