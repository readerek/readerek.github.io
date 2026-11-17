"use strict";

const papersContainer = document.querySelector("#papers");
const trophy = '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M5 2h8v4a4 4 0 0 1-8 0V2Zm0 1H2v2a3 3 0 0 0 3 3m8-5h3v2a3 3 0 0 1-3 3M9 10v4m-3 2h6m-5-2h4"/></svg>';

function makeElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

window.PAPERS.forEach((paper) => {
  const article = makeElement("article", "paper");
  article.id = paper.id;
  article.dataset.categories = paper.categories.join(" ");
  article.setAttribute("aria-labelledby", `${paper.id}-title`);
  const figure = makeElement("figure", "paper-media");
  const imageButton = makeElement("button", "figure-button");
  imageButton.type = "button";
  imageButton.dataset.image = paper.image;
  imageButton.dataset.caption = paper.figureCaption;
  imageButton.setAttribute("aria-label", `Enlarge the ${paper.short} figure`);
  const image = makeElement("img");
  image.src = paper.image;
  image.alt = paper.imageAlt;
  image.loading = "lazy";
  image.width = 700;
  image.height = 400;
  imageButton.append(image);
  const zoom = makeElement("span", "zoom-icon", "↗");
  zoom.setAttribute("aria-hidden", "true");
  imageButton.append(zoom);
  figure.append(imageButton, makeElement("figcaption", "", `${paper.short} / Overview`));
  const content = makeElement("div", "paper-content");
  const kicker = makeElement("div", "paper-kicker");
  kicker.append(makeElement("span", "venue", paper.venue), makeElement("span", `status${paper.status === "Under review" ? " submitted" : ""}`, paper.status), makeElement("span", "author-role", paper.role));
  const title = makeElement("h3");
  title.id = `${paper.id}-title`;
  title.lang = "en";
  if (paper.links.length) {
    const titleLink = makeElement("a", "", paper.title);
    titleLink.href = paper.links[0].url;
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";
    title.append(titleLink);
  } else title.textContent = paper.title;
  const tags = makeElement("div", "paper-tags");
  paper.tags.forEach((tag) => tags.append(makeElement("span", "", tag)));
  const links = makeElement("div", "paper-links");
  paper.links.forEach((link) => {
    const a = makeElement("a", "paper-link", link.label);
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    const arrow = makeElement("span", "", "↗");
    arrow.setAttribute("aria-hidden", "true");
    a.append(arrow);
    links.append(a);
  });
  if (paper.award) {
    const badge = makeElement("button", "award-badge");
    badge.type = "button";
    badge.dataset.image = "assets/best-student-paper.webp";
    badge.dataset.caption = "DeformableGrasp · Best Student Paper Award · Mulsemedia 2026";
    badge.innerHTML = trophy;
    badge.append(document.createTextNode(paper.award));
    links.append(badge);
  }
  content.append(kicker, title, makeElement("p", "paper-description", paper.description), makeElement("p", "paper-highlight", paper.highlight), tags, links);
  article.append(figure, content);
  papersContainer.append(article);
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((other) => {
      const active = other === button;
      other.classList.toggle("active", active);
      other.setAttribute("aria-pressed", String(active));
    });
    let count = 0;
    document.querySelectorAll(".paper").forEach((paper) => {
      const visible = button.dataset.filter === "all" || paper.dataset.categories.split(" ").includes(button.dataset.filter);
      paper.hidden = !visible;
      if (visible) count++;
    });
    document.querySelector("#result-count").textContent = `${count} ${count === 1 ? "work" : "works"}`;
  });
});

const dialog = document.querySelector("#image-dialog");
const expandedImage = document.querySelector("#expanded-image");
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-image]");
  if (!button) return;
  expandedImage.src = button.dataset.image;
  expandedImage.alt = button.dataset.caption;
  document.querySelector("#image-caption").textContent = button.dataset.caption;
  dialog.showModal();
  document.body.classList.add("dialog-open");
});
document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const r = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
});
dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));

const navLinks = [...document.querySelectorAll(".nav-link")];
function updateActiveSection() {
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 12;
  let current = "about";
  ["about", "research", "awards"].forEach((id) => {
    if (document.getElementById(id).getBoundingClientRect().top <= window.innerHeight * .32) current = id;
  });
  if (atBottom) current = "awards";
  navLinks.forEach((link) => {
    const active = link.hash === `#${current}`;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}
window.addEventListener("scroll", updateActiveSection, { passive: true });
updateActiveSection();
document.querySelector("#year").textContent = new Date().getFullYear();
