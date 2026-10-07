const dialog = document.getElementById("search");
const input = document.getElementById("search-input");
const list = document.getElementById("search-results");

const MAX_RESULTS = 8;
const SNIPPET_BEFORE = 30;
const SNIPPET_AFTER = 90;

let entries = [];
let fuse = null;
let results = [];
let selected = 0;

async function load() {
  if (fuse) return;
  const response = await fetch(dialog.dataset.index);
  entries = await response.json();
  fuse = new Fuse(entries, {
    keys: [
      { name: "heading", weight: 3 },
      { name: "title", weight: 3 },
      { name: "content", weight: 1 },
    ],
    threshold: 0.2,
    ignoreLocation: true,
    includeMatches: true,
    minMatchCharLength: 2,
  });
}

// Returns the text around the longest match in the content, or null if the content has no match.
function snippet(entry, matches) {
  const match = (matches || []).find(m => m.key === "content");
  if (!match) return null;
  const item = document.createElement("small");
  const [start, end] = match.indices.reduce((a, b) => (b[1] - b[0] > a[1] - a[0] ? b : a));
  const from = Math.max(0, start - SNIPPET_BEFORE);
  const mark = document.createElement("mark");
  mark.textContent = entry.content.slice(start, end + 1);
  item.append(
    (from > 0 ? "…" : "") + entry.content.slice(from, start),
    mark,
    entry.content.slice(end + 1, end + 1 + SNIPPET_AFTER),
  );
  return item;
}

function render() {
  list.replaceChildren(...results.map(({ item, matches }, i) => {
    const li = document.createElement("li");
    li.setAttribute("aria-selected", i === selected);
    const a = document.createElement("a");
    a.href = item.url;
    const title = document.createElement("span");
    title.textContent = item.heading ? `${item.page} / ${item.heading}` : item.title;
    a.append(title);
    const text = snippet(item, matches);
    if (text) a.append(text);
    a.addEventListener("click", () => dialog.close());
    li.addEventListener("mousemove", () => select(i));
    li.append(a);
    return li;
  }));
}

function select(i) {
  if (i === selected || !results.length) return;
  list.children[selected].setAttribute("aria-selected", false);
  selected = (i + results.length) % results.length;
  list.children[selected].setAttribute("aria-selected", true);
  list.children[selected].scrollIntoView({ block: "nearest" });
}

function search() {
  const query = input.value.trim();
  // With no query, show the blogs.
  results = query
    ? fuse.search(query, { limit: MAX_RESULTS })
    : entries.filter(e => e.post).map(item => ({ item }));
  selected = 0;
  render();
}

async function open() {
  if (dialog.open) return;
  dialog.showModal();
  input.select();
  await load();
  search();
}

document.addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "k") {
    e.preventDefault();
    dialog.open ? dialog.close() : open();
  }
});

// A link to #search opens the dialog.
document.addEventListener("click", e => {
  if (e.target.closest('a[href="#search"]')) {
    e.preventDefault();
    open();
  }
});

input.addEventListener("input", () => fuse && search());

input.addEventListener("keydown", e => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    select(selected + 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    select(selected - 1);
  } else if (e.key === "Enter" && results[selected]) {
    e.preventDefault();
    dialog.close();
    window.location.href = results[selected].item.url;
  }
});

// A click on the backdrop closes the dialog.
dialog.addEventListener("click", e => {
  if (e.target === dialog) dialog.close();
});
