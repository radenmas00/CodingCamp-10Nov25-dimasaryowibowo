document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const dueDateInput = document.getElementById("dueDateInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskTableBody = document.getElementById("taskTableBody");

  const totalTasksEl = document.getElementById("totalTasks");
  const completedTasksEl = document.getElementById("completedTasks");
  const pendingTasksEl = document.getElementById("pendingTasks");
  const progressPercentEl = document.getElementById("progressPercent");
  const progressBarEl = document.getElementById("progressBar");

  // 🔽 Tambahan filter & delete all
  const filterSelect = document.getElementById("filterSelect");
  const deleteAllBtn = document.getElementById("deleteAllBtn");

  let tasks = JSON.parse(localStorage.getItem("todo_tasks_v1") || "[]");

  function save() {
    localStorage.setItem("todo_tasks_v1", JSON.stringify(tasks));
  }

  function renderTasks() {
    taskTableBody.innerHTML = "";
    const today = new Date().toISOString().split("T")[0];

    // Filter tugas berdasarkan pilihan
    const filterValue = filterSelect.value;
    let filteredTasks = tasks;
    if (filterValue === "completed") {
      filteredTasks = tasks.filter((t) => t.completed);
    } else if (filterValue === "pending") {
      filteredTasks = tasks.filter((t) => !t.completed);
    }

    filteredTasks.forEach((t) => {
      const tr = document.createElement("tr");

      if (t.completed) tr.classList.add("completed");
      else if (t.due < today) tr.classList.add("overdue");
      else if (isDueSoon(t.due, today)) tr.classList.add("due-soon");

      tr.innerHTML = `
        <td class="text-left px-4">${escapeHtml(t.text)}</td>
        <td>${t.due}</td>
        <td>
          <input type="checkbox" class="checkbox checkbox-sm toggleStatus" data-id="${t.id}" ${t.completed ? "checked" : ""}>
        </td>
        <td>
          <button class="btn btn-error btn-xs deleteBtn" data-id="${t.id}">Hapus</button>
        </td>
      `;

      taskTableBody.appendChild(tr);
    });

    attachListeners();
    updateStats();
  }

  function attachListeners() {
    document.querySelectorAll(".deleteBtn").forEach((btn) => {
      btn.onclick = () => {
        const id = Number(btn.dataset.id);
        tasks = tasks.filter((x) => x.id !== id);
        save();
        renderTasks();
      };
    });

    document.querySelectorAll(".toggleStatus").forEach((cb) => {
      cb.onchange = () => {
        const id = Number(cb.dataset.id);
        const t = tasks.find((x) => x.id === id);
        if (t) {
          t.completed = cb.checked;
          save();
          renderTasks();
        }
      };
    });
  }

  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
    progressPercentEl.textContent = percent + "%";
    progressBarEl.style.width = percent + "%";
  }

  function isDueSoon(dueDate, today) {
    const d = new Date(dueDate);
    const n = new Date(today);
    const diff = (d - n) / (1000 * 60 * 60 * 24);
    return diff <= 2 && diff > 0;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  addTaskBtn.addEventListener("click", () => {
    const text = taskInput.value.trim();
    const due = dueDateInput.value;

    if (!text) {
      alert("Masukkan nama tugas!");
      taskInput.focus();
      return;
    }
    if (!due) {
      alert("Pilih tanggal jatuh tempo!");
      dueDateInput.focus();
      return;
    }

    const newTask = {
      id: Date.now(),
      text,
      due,
      completed: false,
    };

    tasks.push(newTask);
    save();
    renderTasks();

    taskInput.value = "";
    dueDateInput.value = "";
    taskInput.focus();
  });

  // Enter untuk tambah tugas
  taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTaskBtn.click();
  });

  // 🔽 Tambahan Event Filter
  filterSelect.addEventListener("change", () => renderTasks());

  // 🔽 Tombol Hapus Semua
  deleteAllBtn.addEventListener("click", () => {
    if (tasks.length === 0) return alert("Tidak ada tugas untuk dihapus!");
    if (confirm("Yakin ingin menghapus semua tugas?")) {
      tasks = [];
      save();
      renderTasks();
    }
  });

  renderTasks();
});
