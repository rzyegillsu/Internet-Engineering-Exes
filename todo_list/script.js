const taskInput = document.getElementById('taskInput');
const addBtn    = document.getElementById('addBtn');
const taskList  = document.getElementById('taskList');

function saveTasks() {
  const tasks = [];
  document.querySelectorAll('#taskList li').forEach(li => {
    tasks.push({
      text: li.querySelector('span').textContent,
      done: li.classList.contains('completed')
    });
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask(text, done=false) {
  const li = document.createElement('li');

  const span = document.createElement('span');
  span.textContent = text;

  if (done) li.classList.add('completed');

  span.addEventListener('click', () => {
    li.classList.toggle('completed');
    saveTasks();
  });

  span.addEventListener('dblclick', () => {
    const newText = prompt("ویرایش کار:", span.textContent);
    if (newText !== null && newText.trim() !== "") {
      span.textContent = newText.trim();
      saveTasks();
    }
  });

  const delBtn = document.createElement('button');
  delBtn.textContent = "X";
  delBtn.classList.add("deleteBtn");
  delBtn.addEventListener('click', () => {
    li.remove();
    saveTasks();
  });

  li.appendChild(span);
  li.appendChild(delBtn);
  taskList.appendChild(li);

  saveTasks();
}

addBtn.addEventListener('click', () => {
  if (taskInput.value.trim()) {
    addTask(taskInput.value);
    taskInput.value = '';
  }
});


const saved = JSON.parse(localStorage.getItem('tasks') || '[]');
saved.forEach(t => addTask(t.text, t.done));


const searchBox = document.getElementById('searchBox');
searchBox.addEventListener('input', () => {
  const query = searchBox.value.toLowerCase();
  document.querySelectorAll('#taskList li').forEach(li => {
    const text = li.querySelector('span').textContent.toLowerCase();
    li.style.display = text.includes(query) ? '' : 'none';
  });
});


const filters = document.querySelectorAll('#filters button');
filters.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    document.querySelectorAll('#taskList li').forEach(li => {
      if (filter === "all") {
        li.style.display = '';
      } else if (filter === "completed") {
        li.style.display = li.classList.contains('completed') ? '' : 'none';
      } else if (filter === "active") {
        li.style.display = !li.classList.contains('completed') ? '' : 'none';
      }
    });
  });
});

