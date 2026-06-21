/* ============================================================
   CLASS PLANNER — app logic
   Vanilla JS, no build step. State persists to localStorage so
   the page works the same on GitHub Pages as it does locally.
   ============================================================ */

const STORAGE_KEY = "classPlannerState_v1";

const STATUS = {
  "not-started": "Not started",
  "started": "Started",
  "submitted": "Submitted",
  "completed": "Completed",
};

const STATUS_ORDER = ["not-started", "started", "submitted", "completed"];

/* ---------- state ---------- */

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { classes: [], selectedClassId: null };
    const parsed = JSON.parse(raw);
    if (!parsed.classes) return { classes: [], selectedClassId: null };
    return parsed;
  } catch (e) {
    console.error("Could not read saved data, starting fresh.", e);
    return { classes: [], selectedClassId: null };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Could not save data.", e);
  }
}

let state = loadState();

/* ---------- helpers ---------- */

function findClass(classId) {
  return state.classes.find((c) => c.id === classId);
}

function findWeek(cls, weekId) {
  return cls.weeks.find((w) => w.id === weekId);
}

function findEntry(week, entryId) {
  return week.entries.find((e) => e.id === entryId);
}

function rowsOf(entry) {
  return entry.rows;
}

function allRows(cls) {
  const rows = [];
  cls.weeks.forEach((w) => w.entries.forEach((e) => rows.push(...e.rows)));
  return rows;
}

function progressOf(cls) {
  const rows = allRows(cls);
  const total = rows.length;
  const done = rows.filter((r) => r.status === "completed").length;
  return { done, total };
}

function nextWeekLabel(cls) {
  return "WK " + (cls.weeks.length + 1);
}

function makeRowsForType(type) {
  if (type === "discussion") {
    return [
      { id: uid(), label: "Discussion Post", dueDate: "", submittedDate: "", status: "not-started" },
      { id: uid(), label: "Reply 1", dueDate: "", submittedDate: "", status: "not-started" },
      { id: uid(), label: "Reply 2", dueDate: "", submittedDate: "", status: "not-started" },
    ];
  }
  return [{ id: uid(), label: "Assignment", dueDate: "", submittedDate: "", status: "not-started" }];
}

/* ---------- mutations ---------- */

function addClass(name) {
  const cls = { id: uid(), name: name.trim(), weeks: [] };
  state.classes.push(cls);
  state.selectedClassId = cls.id;
  saveState();
  render();
}

function deleteClass(classId) {
  const cls = findClass(classId);
  if (!cls) return;
  if (!confirm(`Delete "${cls.name}" and everything in it? This can't be undone.`)) return;
  state.classes = state.classes.filter((c) => c.id !== classId);
  if (state.selectedClassId === classId) {
    state.selectedClassId = state.classes.length ? state.classes[0].id : null;
  }
  saveState();
  render();
}

function selectClass(classId) {
  state.selectedClassId = classId;
  saveState();
  render();
}

function addWeek(classId) {
  const cls = findClass(classId);
  if (!cls) return;
  cls.weeks.push({ id: uid(), label: nextWeekLabel(cls), collapsed: false, entries: [] });
  saveState();
  render();
}

function toggleWeekCollapse(classId, weekId) {
  const cls = findClass(classId);
  const week = findWeek(cls, weekId);
  if (!week) return;
  week.collapsed = !week.collapsed;
  saveState();
  render();
}

function deleteWeek(classId, weekId) {
  const cls = findClass(classId);
  if (!cls) return;
  if (!confirm("Delete this week and all of its items?")) return;
  cls.weeks = cls.weeks.filter((w) => w.id !== weekId);
  saveState();
  render();
}

function renameWeek(classId, weekId, label) {
  const cls = findClass(classId);
  const week = findWeek(cls, weekId);
  if (!week) return;
  week.label = label;
  saveState();
}

function addEntry(classId, weekId, type, title) {
  const cls = findClass(classId);
  const week = findWeek(cls, weekId);
  if (!week) return;
  week.entries.push({
    id: uid(),
    type,
    title: title.trim(),
    grade: "",
    rows: makeRowsForType(type),
  });
  saveState();
  render();
}

function deleteEntry(classId, weekId, entryId) {
  const cls = findClass(classId);
  const week = findWeek(cls, weekId);
  if (!week) return;
  week.entries = week.entries.filter((e) => e.id !== entryId);
  saveState();
  render();
}

function renameEntry(classId, weekId, entryId, title) {
  const cls = findClass(classId);
  const week = findWeek(cls, weekId);
  const entry = findEntry(week, entryId);
  if (!entry) return;
  entry.title = title;
  saveState();
}

function updateEntryGrade(classId, weekId, entryId, grade) {
  const cls = findClass(classId);
  const week = findWeek(cls, weekId);
  const entry = findEntry(week, entryId);
  if (!entry) return;
  entry.grade = grade;
  saveState();
}

function updateRowDueDate(classId, weekId, entryId, rowId, value) {
  const cls = findClass(classId);
  const week = findWeek(cls, weekId);
  const entry = findEntry(week, entryId);
  const row = entry.rows.find((r) => r.id === rowId);
  if (!row) return;
  row.dueDate = value;
  saveState();
}

function updateRowSubmittedDate(classId, weekId, entryId, rowId, value) {
  const cls = findClass(classId);
  const week = findWeek(cls, weekId);
  const entry = findEntry(week, entryId);
  const row = entry.rows.find((r) => r.id === rowId);
  if (!row) return;
  row.submittedDate = value;
  saveState();
}

function setRowStatus(classId, weekId, entryId, rowId, status) {
  const cls = findClass(classId);
  const week = findWeek(cls, weekId);
  const entry = findEntry(week, entryId);
  const row = entry.rows.find((r) => r.id === rowId);
  if (!row) return;
  row.status = status;
  saveState();
  render();
}

function toggleRowStamp(classId, weekId, entryId, rowId) {
  const cls = findClass(classId);
  const week = findWeek(cls, weekId);
  const entry = findEntry(week, entryId);
  const row = entry.rows.find((r) => r.id === rowId);
  if (!row) return;
  row.status = row.status === "completed" ? "started" : "completed";
  saveState();
  render();
}

/* ---------- rendering ---------- */

const classListEl = document.getElementById("classList");
const mainEl = document.getElementById("main");

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function renderSidebar() {
  classListEl.innerHTML = "";
  state.classes.forEach((cls) => {
    const { done, total } = progressOf(cls);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "class-tab" + (cls.id === state.selectedClassId ? " active" : "");
    btn.innerHTML = `
      <span class="name">${escapeHtml(cls.name)}</span>
      <span class="progress-chip">${total ? `${done}/${total}` : "—"}</span>
      <button type="button" class="del-class" title="Delete class" aria-label="Delete ${escapeHtml(cls.name)}">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5.5 4V2.5h3V4M3.5 4l.6 8h5.8l.6-8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    `;
    btn.addEventListener("click", (e) => {
      if (e.target.closest(".del-class")) {
        e.stopPropagation();
        deleteClass(cls.id);
        return;
      }
      selectClass(cls.id);
    });
    classListEl.appendChild(btn);
  });
}

function checkIconSvg() {
  return `<svg viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5l3 3 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function gradeTone(raw) {
  const v = (raw ?? "").trim();
  if (!v) return "none";
  const letterMatch = v.match(/^[A-Fa-f][+-]?/);
  if (letterMatch) {
    const letter = letterMatch[0][0].toUpperCase();
    if (letter === "A") return "good";
    if (letter === "B" || letter === "C") return "mid";
    return "low"; // D, F
  }
  const numMatch = v.match(/-?\d+(\.\d+)?/);
  if (numMatch) {
    const n = parseFloat(numMatch[0]);
    if (n >= 90) return "good";
    if (n >= 75) return "mid";
    return "low";
  }
  return "none";
}

function applyGradeTone(input) {
  const tone = gradeTone(input.value);
  input.classList.remove("grade-good", "grade-mid", "grade-low");
  if (tone !== "none") input.classList.add("grade-" + tone);
}

function renderRow(cls, week, entry, row) {
  const wrap = document.createElement("div");
  wrap.className = "row";

  const stamp = document.createElement("button");
  stamp.type = "button";
  stamp.className = "stamp" + (row.status === "completed" ? " done" : "");
  stamp.title = row.status === "completed" ? "Mark as not completed" : "Mark as completed";
  stamp.innerHTML = checkIconSvg();
  stamp.addEventListener("click", () => toggleRowStamp(cls.id, week.id, entry.id, row.id));

  const label = document.createElement("span");
  label.className = "row-label";
  label.textContent = row.label;

  const due = document.createElement("input");
  due.type = "date";
  due.className = "due-input";
  due.value = row.dueDate || "";
  due.addEventListener("change", (e) => updateRowDueDate(cls.id, week.id, entry.id, row.id, e.target.value));

  const submitted = document.createElement("input");
  submitted.type = "date";
  submitted.className = "due-input submitted-input";
  submitted.value = row.submittedDate || "";
  submitted.addEventListener("change", (e) => updateRowSubmittedDate(cls.id, week.id, entry.id, row.id, e.target.value));

  const status = document.createElement("select");
  status.className = "status-select";
  status.setAttribute("data-status", row.status);
  STATUS_ORDER.forEach((key) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = STATUS[key];
    if (key === row.status) opt.selected = true;
    status.appendChild(opt);
  });
  status.addEventListener("change", (e) => setRowStatus(cls.id, week.id, entry.id, row.id, e.target.value));

  wrap.append(stamp, label, due, submitted, status);
  return wrap;
}

function renderEntry(cls, week, entry) {
  const wrap = document.createElement("div");
  wrap.className = "entry";

  const head = document.createElement("div");
  head.className = "entry-head";

  const pill = document.createElement("span");
  pill.className = "type-pill " + entry.type;
  pill.textContent = entry.type === "discussion" ? "Discussion" : "Assignment";

  const title = document.createElement("input");
  title.type = "text";
  title.className = "entry-title";
  title.placeholder = entry.type === "discussion" ? "Add a topic (optional)" : "Add a title (optional)";
  title.value = entry.title || "";
  title.addEventListener("change", (e) => renameEntry(cls.id, week.id, entry.id, e.target.value));

  const gradeWrap = document.createElement("div");
  gradeWrap.className = "entry-grade-wrap";
  gradeWrap.title = entry.type === "discussion"
    ? "Shared grade — covers the discussion post and both replies"
    : "Grade for this assignment";
  gradeWrap.innerHTML = `<span>Grade:</span>`;
  const gradeInput = document.createElement("input");
  gradeInput.type = "text";
  gradeInput.className = "entry-grade";
  gradeInput.placeholder = "—";
  gradeInput.value = entry.grade || "";
  applyGradeTone(gradeInput);
  gradeInput.addEventListener("input", (e) => applyGradeTone(e.target));
  gradeInput.addEventListener("change", (e) => updateEntryGrade(cls.id, week.id, entry.id, e.target.value));
  gradeWrap.appendChild(gradeInput);

  const del = document.createElement("button");
  del.type = "button";
  del.className = "del-entry";
  del.title = "Delete item";
  del.innerHTML = `<svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5.5 4V2.5h3V4M3.5 4l.6 8h5.8l.6-8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  del.addEventListener("click", () => deleteEntry(cls.id, week.id, entry.id));

  head.append(pill, title, gradeWrap, del);

  const rowHead = document.createElement("div");
  rowHead.className = "row-head";
  rowHead.innerHTML = `<span></span><span>Item</span><span>Due date</span><span>Submitted On</span><span>Status</span>`;

  const rows = document.createElement("div");
  rows.className = "rows";
  entry.rows.forEach((row) => rows.appendChild(renderRow(cls, week, entry, row)));

  wrap.append(head, rowHead, rows);
  return wrap;
}

function renderAddEntryControl(cls, week, container) {
  const row = document.createElement("div");
  row.className = "add-entry-row";

  const openBtn = document.createElement("button");
  openBtn.type = "button";
  openBtn.className = "btn-add-entry";
  openBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Add item`;

  const form = document.createElement("div");
  form.className = "add-entry-form";
  form.hidden = true;
  form.innerHTML = `
    <select class="entry-type-select">
      <option value="assignment">Assignment</option>
      <option value="discussion">Discussion post</option>
    </select>
    <input type="text" class="entry-title-input" placeholder="Title or topic (optional)">
    <button type="button" class="btn-confirm-entry">Add</button>
    <button type="button" class="btn-cancel-entry">Cancel</button>
  `;

  openBtn.addEventListener("click", () => {
    openBtn.hidden = true;
    form.hidden = false;
    form.querySelector(".entry-title-input").focus();
  });

  form.querySelector(".btn-cancel-entry").addEventListener("click", () => {
    form.hidden = true;
    openBtn.hidden = false;
  });

  form.querySelector(".btn-confirm-entry").addEventListener("click", () => {
    const type = form.querySelector(".entry-type-select").value;
    const title = form.querySelector(".entry-title-input").value;
    addEntry(cls.id, week.id, type, title);
  });

  row.append(openBtn, form);
  container.appendChild(row);
}

function renderWeek(cls, week) {
  const wrap = document.createElement("div");
  wrap.className = "week" + (week.collapsed ? " collapsed" : "");

  const tabRow = document.createElement("div");
  tabRow.className = "week-tab-row";

  const tab = document.createElement("div");
  tab.className = "week-tab";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "week-toggle";
  toggle.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  toggle.addEventListener("click", () => toggleWeekCollapse(cls.id, week.id));

  const labelInput = document.createElement("input");
  labelInput.type = "text";
  labelInput.value = week.label;
  labelInput.setAttribute("aria-label", "Week label");
  labelInput.addEventListener("change", (e) => renameWeek(cls.id, week.id, e.target.value));

  const { done, total } = (() => {
    const rows = week.entries.flatMap((e) => e.rows);
    return { done: rows.filter((r) => r.status === "completed").length, total: rows.length };
  })();

  const count = document.createElement("span");
  count.className = "week-count";
  count.textContent = total ? `${done}/${total} done` : "no items yet";

  const delWeek = document.createElement("button");
  delWeek.type = "button";
  delWeek.className = "del-week";
  delWeek.title = "Delete week";
  delWeek.innerHTML = `<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5.5 4V2.5h3V4M3.5 4l.6 8h5.8l.6-8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  delWeek.addEventListener("click", () => deleteWeek(cls.id, week.id));

  tab.append(toggle, labelInput, count, delWeek);
  tabRow.appendChild(tab);

  const body = document.createElement("div");
  body.className = "week-body";

  const bodyInner = document.createElement("div");
  bodyInner.className = "week-body-inner";

  week.entries.forEach((entry) => bodyInner.appendChild(renderEntry(cls, week, entry)));
  renderAddEntryControl(cls, week, bodyInner);

  body.appendChild(bodyInner);
  wrap.append(tabRow, body);
  return wrap;
}

function renderMain() {
  mainEl.innerHTML = "";

  const cls = findClass(state.selectedClassId);

  if (!cls) {
    mainEl.innerHTML = `
      <div class="empty-state">
        <h2>No class selected yet</h2>
        <p>Add a class from the sidebar to start building out your weekly plan — assignments, discussion posts, and replies, all tracked in one ledger.</p>
      </div>
    `;
    return;
  }

  const header = document.createElement("div");
  header.className = "class-header";

  const { done, total } = progressOf(cls);
  const pct = total ? Math.round((done / total) * 100) : 0;

  header.innerHTML = `
    <div>
      <h2 class="class-name">${escapeHtml(cls.name)}</h2>
      <div class="class-meta">${cls.weeks.length} week${cls.weeks.length === 1 ? "" : "s"} planned</div>
    </div>
    <div class="progress-ring-wrap">
      <div class="progress-ring" style="--pct:${pct}">
        <div class="progress-ring-hole"><strong>${total ? pct + "%" : "—"}</strong></div>
      </div>
      <div class="progress-ring-label">Overall progress<span>${total ? `${done}/${total} done` : "No items yet"}</span></div>
    </div>
  `;

  const addWeekBtn = document.createElement("button");
  addWeekBtn.type = "button";
  addWeekBtn.className = "btn-add-week";
  addWeekBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Add ${nextWeekLabel(cls)}`;
  addWeekBtn.addEventListener("click", () => addWeek(cls.id));

  mainEl.append(header, addWeekBtn);

  if (!cls.weeks.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.style.margin = "8vh auto 0";
    empty.innerHTML = `<h2>No weeks yet</h2><p>Click "Add ${nextWeekLabel(cls)}" to start planning this class.</p>`;
    mainEl.appendChild(empty);
    return;
  }

  cls.weeks.forEach((week) => mainEl.appendChild(renderWeek(cls, week)));
}

function render() {
  renderSidebar();
  renderMain();
}

/* ---------- add-class form wiring ---------- */

const openAddClassBtn = document.getElementById("openAddClass");
const addClassForm = document.getElementById("addClassForm");
const newClassNameInput = document.getElementById("newClassName");
const cancelAddClassBtn = document.getElementById("cancelAddClass");

openAddClassBtn.addEventListener("click", () => {
  openAddClassBtn.hidden = true;
  addClassForm.hidden = false;
  newClassNameInput.focus();
});

cancelAddClassBtn.addEventListener("click", () => {
  addClassForm.hidden = true;
  openAddClassBtn.hidden = false;
  newClassNameInput.value = "";
});

addClassForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = newClassNameInput.value.trim();
  if (!name) return;
  addClass(name);
  newClassNameInput.value = "";
  addClassForm.hidden = true;
  openAddClassBtn.hidden = false;
});

/* ---------- boot ---------- */

render();
