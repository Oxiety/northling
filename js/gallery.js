(() => {
  "use strict";
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
  document.querySelectorAll("[data-gallery]").forEach(async (gallery) => {
    const type = gallery.dataset.gallery;
    try {
      const response = await fetch(`data/${type}.json`, { cache: "no-store" });
      if (!response.ok) throw new Error("Не удалось загрузить галерею");
      const data = await response.json();
      const items = Array.isArray(data.items) ? data.items : [];
      if (!items.length) {
        gallery.innerHTML = '<p class="gallery-empty">Пока здесь пусто. Добавь изображения через <a href="admin/">админку</a>.</p>';
        return;
      }
      gallery.innerHTML = items.map((item) => {
        const image = esc(item.image || "");
        const title = esc(item.title || "Без названия");
        const alt = esc(item.alt || item.title || "");
        const details = [];
        if (item.date) details.push(`<span><b>Дата съёмки</b>${esc(item.date)}</span>`);
        if (item.location) details.push(`<span><b>Место съёмки</b>${esc(item.location)}</span>`);
        const caption = esc([item.title || "", item.date ? `Дата съёмки: ${item.date}` : "", item.location ? `Место съёмки: ${item.location}` : ""].filter(Boolean).join(" · "));
        return `<figure class="shot rv"><button type="button" data-full="${image}" data-alt="${alt}" data-caption="${caption}" aria-label="Открыть: ${title}"><img src="${image}" alt="${alt}" loading="lazy"><span class="cap">${title}</span></button>${details.length ? `<figcaption class="shot-meta">${details.join("")}</figcaption>` : ""}</figure>`;
      }).join("");
      gallery.dispatchEvent(new CustomEvent("gallery:updated", { bubbles: true }));
      gallery.querySelectorAll(".rv").forEach((el, index) => {
        el.classList.add("in");
        el.style.setProperty("--d", `${Math.min(index, 5) * .08}s`);
      });
    } catch (error) {
      gallery.innerHTML = '<p class="gallery-empty">Не получилось загрузить галерею. Проверь файл данных в <code>data/</code>.</p>';
      console.error(error);
    }
  });
})();