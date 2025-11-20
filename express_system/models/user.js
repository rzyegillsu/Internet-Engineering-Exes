// Simple in-memory "model". In real project replace with DB (Mongo/SQLite).
let users = [];
let idCounter = 1;


module.exports = {
    all() {
        return users;
    },
    find(id) {
        return users.find(u => u.id === Number(id));
    },
    create(data) {
        const user = { id: idCounter++, ...data };
        users.push(user);
        return user;
    },
    update(id, data) {
        const idx = users.findIndex(u => u.id === Number(id));
        if (idx === -1) return null;
        users[idx] = { ...users[idx], ...data };
        return users[idx];
    },
    remove(id) {
        const idx = users.findIndex(u => u.id === Number(id));
        if (idx === -1) return false;
        users.splice(idx, 1);
        return true;
    },
    reset() {
        users = [];
        idCounter = 1;
    }
};