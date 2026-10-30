(() => {
  "use strict";
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
      document.querySelectorAll("[data-site-marquee]").forEach(node => {
        const value = data[node.dataset.siteMarquee];
        if (typeof value === "string" && value.trim()) {
          const words = value.split("|").map(word => word.trim()).filter(Boolean);
          const group = () => `<div class="marquee-group">${words.map(word => `<span>${word.replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[ch]))}</span>`).join("")}</div>`;
          node.innerHTML = group() + group();
        }
      });
      document.querySelectorAll("[data-site-image]").forEach(node => {
        const value = data[node.dataset.siteImage];
        if (typeof value === "string" && value.trim()) node.src = value;
        const altKey = node.dataset.siteImageAlt;
        if (altKey && typeof data[altKey] === "string") node.alt = data[altKey];
      });
    })
    .catch(error => console.error(error));
})();
