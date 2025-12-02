const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/user');

exports.list = asyncHandler(async (req, res) => {
    const profiles = User.listProfiles();
    return res.formatSuccess({ users: profiles });
});

exports.get = asyncHandler(async (req, res) => {
    const profile = User.getProfile(req.params.id);
    if (!profile) {
        return res.formatError({ status: 404, message: 'User not found' });
    }
    return res.formatSuccess(profile);
});

exports.create = asyncHandler(async (req, res) => {
    const { name, age } = req.body;
    const profile = User.createProfile({ name, age });
    return res.formatSuccess(profile, 201);
});

exports.update = asyncHandler(async (req, res) => {
    const { name, age } = req.body;
    const updated = User.updateProfile(req.params.id, { name, age });
    if (!updated) {
        return res.formatError({ status: 404, message: 'User not found' });
    }
    return res.formatSuccess(updated);
});

exports.del = asyncHandler(async (req, res) => {
    const deleted = User.deleteProfile(req.params.id);
    if (!deleted) {
        return res.formatError({ status: 404, message: 'User not found' });
    }
    return res.formatSuccess({ message: 'User removed', id: Number(req.params.id) });
});