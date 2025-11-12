async function api(path, opts = {}) {
    const res = await fetch(path, opts);
    if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed: ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
}

async function loadTodos() {
const filter = document.querySelector('.filters button.active').dataset.filter;
let url = '/api/todos';
if (filter === 'active') url = '/api/todos?done=false';
if (filter === 'done') url = '/api/todos?done=true';


const todos = await api(url);
const list = document.getElementById('list');
list.innerHTML = '';
const tpl = document.getElementById('item-tpl');

todos.forEach(t => {
        const node = tpl.content.cloneNode(true);
        const li = node.querySelector('li');
        const toggleBtn = node.querySelector('.toggle');
        const textSpan = node.querySelector('.text');
        const editBtn = node.querySelector('.edit');
        const delBtn = node.querySelector('.delete');


        li.dataset.id = t.id;
        textSpan.textContent = t.text;
        toggleBtn.textContent = t.done ? '✅' : '⬜';
        if (t.done) li.classList.add('done');


        toggleBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await api(`/api/todos/${t.id}`, { method: 'PUT' });
            loadTodos();
        });

        editBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const newText = prompt('Edit todo', t.text);
            if (newText !== null) {
                await api(`/api/todos/${t.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newText })
            });
            loadTodos();
            }
        });


        delBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Delete this todo?')) {
                await api(`/api/todos/${t.id}`, { method: 'DELETE' });
                loadTodos();
            }
        });


        list.appendChild(node);
    });
}

async function addTodo() {
const input = document.getElementById('newTodo');
const text = input.value.trim();
if (!text) return alert('Please enter a task');
await api('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
});
input.value = '';
loadTodos();
}

document.getElementById('addBtn').addEventListener('click', addTodo);
document.getElementById('newTodo').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTodo();
});


document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadTodos();
    });
});


loadTodos().catch(err => console.error(err));