(() => {
  "use strict";
  const target = document.getElementById("oasisAlbums");
  if (!target) return;
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
  fetch("data/oasis.json", { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("Не удалось загрузить дискографию");
      return response.json();
    })
    .then(data => {
      const albums = Array.isArray(data.albums) ? data.albums : [];
      if (!albums.length) {
        target.innerHTML = '<p class="gallery-empty">Альбомы пока не добавлены.</p>';
        return;
      }
      target.innerHTML = albums.map((album, index) => {
        const tracks = Array.isArray(album.tracks) ? album.tracks : [];
        return `<article class="card album-card rv">
          <div class="album-meta"><span class="n">${String(index + 1).padStart(2, "0")}</span><span class="album-year">${esc(album.year)}</span></div>
          <h3>${esc(album.title)}</h3>
          <p class="album-description">${esc(album.description)}</p>
          <ol class="album-tracks">${tracks.map((track, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span>${esc(track)}</li>`).join("")}</ol>
        </article>`;
      }).join("");
      target.querySelectorAll(".rv").forEach(el => el.classList.add("in"));
    })
    .catch(error => {
      target.innerHTML = '<p class="gallery-empty">Не получилось загрузить дискографию. Проверь data/oasis.json.</p>';
      console.error(error);
    });
})();