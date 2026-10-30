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
      document.querySelectorAll("[data-site-image]").forEach(node => {
        const value = data[node.dataset.siteImage];
        if (typeof value === "string" && value.trim()) node.src = value;
      });
    })
    .catch(error => console.error(error));
})();
