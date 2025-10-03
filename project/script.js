const taskInput = document.getElementById('taskInput');
const addBtn    = document.getElementById('addBtn');
const taskList  = document.getElementById('taskList');


function saveTasks() {
  const tasks = [];
  document.querySelectorAll('#taskList li').forEach(li => {
    tasks.push({
      text: li.querySelector('span').textContent,
      done: li.classList.contains('done')
    });
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}


function addTask(text, done=false) {
  const li = document.createElement('li');

  const span = document.createElement('span');
  span.textContent = text;

  if (done) li.classList.add('done');

  span.addEventListener('click', () => {
    li.classList.toggle('done');
    saveTasks();
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
