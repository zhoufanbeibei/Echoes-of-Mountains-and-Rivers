(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  document.querySelectorAll("[data-scrollto]").forEach((el) => {
    el.addEventListener("click", () => {
      const target = el.getAttribute("data-scrollto");
      if (!target) return;
      const node = document.querySelector(target);
      if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // 顶部导航锚点也做平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const node = document.querySelector(href);
      if (!node) return;
      e.preventDefault();
      node.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", href);
    });
  });
})();

