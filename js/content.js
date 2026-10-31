(() => {
  "use strict";
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const marqueeNodes = [];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Бегущая строка сдвигается ровно на половину трека, поэтому каждая половина
  // должна быть шире экрана. Иначе в конце цикла справа появляется пустота.
  const renderMarquee = (node, words) => {
    const group = `<div class="marquee-group">${words.map(word => `<span>${escapeHtml(word)}</span>`).join("")}</div>`;
    let copies = 1;
    const build = () => {
      const half = group.repeat(copies);
      node.innerHTML = half + half;
    };
    build();
    while (node.offsetWidth / 2 < window.innerWidth && copies < 50) {
      copies++;
      build();
    }
    if (!reduceMotion) {
      // Скорость держим примерно постоянной (≈30 px/с), сколько бы ни было копий.
      node.style.animationDuration = `${Math.max(20, (node.offsetWidth / 2) / 30)}s`;
    }
  };

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => marqueeNodes.forEach(({ node, words }) => renderMarquee(node, words)), 200);
  });

  // Картинки с data-site-image прячем до подмены src, чтобы не мигала картинка по умолчанию.
  const revealImages = () => {
    document.querySelectorAll("[data-site-image]").forEach(node => { node.style.visibility = "visible"; });
  };

  fetch("data/site.json", { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("Не удалось загрузить тексты сайта");
      return response.json();
    })
    .then(data => {
      document.querySelectorAll("[data-site-content]").forEach(node => {
        const value = data[node.dataset.siteContent];
        if (typeof value === "string") node.textContent = value;
      });
      document.querySelectorAll(".marquee-track").forEach(node => {
        let words = null;
        const value = node.dataset.siteMarquee ? data[node.dataset.siteMarquee] : null;
        if (typeof value === "string" && value.trim()) {
          words = value.split("|").map(word => word.trim()).filter(Boolean);
        } else {
          // Строки без ключа в data/site.json берём из статичного HTML (первая группа).
          const first = node.querySelector(".marquee-group");
          if (first) words = [...first.querySelectorAll("span")].map(span => span.textContent.trim()).filter(Boolean);
        }
        if (words && words.length) {
          renderMarquee(node, words);
          marqueeNodes.push({ node, words });
        }
      });
      document.querySelectorAll("[data-site-image]").forEach(node => {
        const value = data[node.dataset.siteImage];
        if (typeof value === "string" && value.trim()) node.src = value;
        const altKey = node.dataset.siteImageAlt;
        if (altKey && typeof data[altKey] === "string") node.alt = data[altKey];
      });
    })
    .catch(error => console.error(error))
    .finally(revealImages);
})();
