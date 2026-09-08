const portfolio = window.PORTFOLIO;
const root = document.documentElement;
const projectGrid = document.querySelector("[data-projects]");
const projectDialog = document.querySelector("[data-project-dialog]");
const commandDialog = document.querySelector("[data-command-dialog]");
const commandInput = document.querySelector("[data-command-input]");
const commandList = document.querySelector(".command-list");
const toast = document.querySelector("[data-toast]");

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => { element.textContent = value; });
}

function hydrateIdentity() {
  const { identity } = portfolio;
  setText("[data-name]", identity.name);
  setText("[data-intro]", identity.intro);
  setText("[data-availability]", identity.availability);
  setText("[data-location]", identity.location);
  setText("[data-email]", identity.email);
  setText("[data-domain]", identity.domain);
  setText("[data-year]", new Date().getFullYear());
  document.title = `${identity.name} — ${identity.role}`;

  const serviceItems = [...portfolio.services, ...portfolio.services, ...portfolio.services, ...portfolio.services];
  document.querySelector("[data-services]").innerHTML = serviceItems
    .map((service) => `<span class="marquee-item"><span>${service}</span><i></i></span>`)
    .join("");

  document.querySelector("[data-links]").innerHTML = portfolio.links
    .map((link) => `<a href="${link.url}" target="_blank" rel="noreferrer">${link.label} ↗</a>`)
    .join("");
}

function projectCard(project) {
  return `
    <button class="project-card" type="button" data-project="${project.id}" data-category="${project.category}" style="--project-color:${project.color}">
      <span class="project-top"><span>${project.number} / ${project.category}</span><span>${project.year}</span></span>
      <span class="project-arrow" aria-hidden="true">↗</span>
      <h3>${project.title}</h3>
      <p>${project.short}</p>
      <span class="tag-list">${project.stack.map((item) => `<span>${item}</span>`).join("")}</span>
    </button>`;
}

function renderProjects() {
  projectGrid.innerHTML = portfolio.projects.map(projectCard).join("");
  projectGrid.querySelectorAll("[data-project]").forEach((card) => {
    card.addEventListener("click", () => openProject(card.dataset.project));
  });
}

function openProject(id) {
  const project = portfolio.projects.find((item) => item.id === id);
  if (!project) return;
  setText("[data-dialog-number]", project.number);
  setText("[data-dialog-category]", `${project.category} · ${project.year}`);
  setText("[data-dialog-title]", project.title);
  setText("[data-dialog-short]", project.short);
  setText("[data-dialog-challenge]", project.challenge);
  setText("[data-dialog-outcome]", project.outcome);
  document.querySelector("[data-dialog-tags]").innerHTML = project.stack.map((item) => `<span>${item}</span>`).join("");
  projectDialog.style.setProperty("--dialog-color", project.color);
  projectDialog.showModal();
}

document.querySelector(".dialog-close").addEventListener("click", () => projectDialog.close());
projectDialog.addEventListener("click", (event) => {
  if (event.target === projectDialog) projectDialog.close();
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
    document.querySelectorAll("[data-project]").forEach((card) => {
      card.hidden = button.dataset.filter !== "all" && card.dataset.category !== button.dataset.filter;
    });
  });
});

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("portfolio-theme", theme);
}

setTheme(localStorage.getItem("portfolio-theme") || "dark");
document.querySelector(".theme-button").addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

const commands = [
  { label: "View selected work", hint: "#work", action: () => location.assign("#work") },
  { label: "Read about the practice", hint: "#about", action: () => location.assign("#about") },
  { label: "Start a conversation", hint: "Email", action: () => location.assign(`mailto:${portfolio.identity.email}`) },
  { label: "Switch color mode", hint: "Theme", action: () => document.querySelector(".theme-button").click() }
];

function renderCommands(query = "") {
  const matching = commands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase()));
  commandList.innerHTML = matching.length
    ? matching.map((command, index) => `<button class="command-item ${index === 0 ? "active" : ""}" type="button" data-command="${commands.indexOf(command)}"><span>${command.label}</span><small>${command.hint}</small></button>`).join("")
    : `<div class="command-item">No matching command</div>`;
  commandList.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("click", () => {
      commandDialog.close();
      commands[Number(button.dataset.command)].action();
    });
  });
}

function openCommands() {
  renderCommands();
  commandDialog.showModal();
  requestAnimationFrame(() => commandInput.focus());
}

document.querySelector(".command-button").addEventListener("click", openCommands);
commandInput.addEventListener("input", () => renderCommands(commandInput.value));
commandInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") commandList.querySelector("[data-command]")?.click();
});
commandDialog.addEventListener("close", () => { commandInput.value = ""; });
commandDialog.addEventListener("click", (event) => {
  if (event.target === commandDialog) commandDialog.close();
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    commandDialog.open ? commandDialog.close() : openCommands();
  }
});

document.querySelector("[data-email-copy]").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(portfolio.identity.email);
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2200);
  } catch {
    location.assign(`mailto:${portfolio.identity.email}`);
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .13 });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const pointerGlow = document.querySelector(".pointer-glow");
window.addEventListener("pointermove", (event) => {
  pointerGlow.style.left = `${event.clientX}px`;
  pointerGlow.style.top = `${event.clientY}px`;
}, { passive: true });

const scrambleElement = document.querySelector("[data-scramble]");
const scrambleCharacters = "*+~<>/{}[]01";
scrambleElement.addEventListener("pointerenter", () => {
  const finalText = scrambleElement.dataset.scramble;
  let frame = 0;
  const timer = setInterval(() => {
    scrambleElement.textContent = finalText.split("").map((character, index) => {
      if (character === " ") return " ";
      if (index < frame / 2) return finalText[index];
      return scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)];
    }).join("");
    frame += 1;
    if (frame >= finalText.length * 2 + 2) {
      clearInterval(timer);
      scrambleElement.textContent = finalText;
    }
  }, 38);
});

hydrateIdentity();
renderProjects();
