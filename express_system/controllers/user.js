const User = require('../models/user');


exports.list = (req, res) => {
    res.json(User.all());
};


exports.get = (req, res, next) => {
    const user = User.find(req.params.id);
    if (!user) return next({ status: 404, message: 'User not found' });
    res.json(user);
};


exports.create = (req, res, next) => {
    const payload = req.body;
    if (!payload || !payload.firstname || !payload.lastname) {
        return next({ status: 400, message: 'firstname and lastname are required' });
}
    const user = User.create(payload);
    res.status(201).json(user);
};


exports.update = (req, res, next) => {
    const user = User.update(req.params.id, req.body);
    if (!user) return next({ status: 404, message: 'User not found' });
    res.json(user);
};


exports.del = (req, res, next) => {
    const ok = User.remove(req.params.id);
    if (!ok) return next({ status: 404, message: 'User not found' });
    res.status(204).send();
};