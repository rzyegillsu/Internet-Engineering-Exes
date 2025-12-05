const NodeCache = require("node-cache");
const Todo = require("../models/Todo");

const cache = new NodeCache({
  stdTTL: Number(process.env.CACHE_TTL || 20),
  checkperiod: 30,
});

const cacheKeyFromQuery = ({ status = "", search = "" }) =>
  JSON.stringify({ status, search });

const renderWithFilters = (res, view, data = {}) =>
  res.render(view, {
    title: data.title || "Todo List",
    search: data.search || "",
    status: data.status || "",
    todos: data.todos || [],
    todo: data.todo || null,
  });

exports.getTodos = async (req, res, next) => {
  const { status = "", search = "" } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (search) filter.title = { $regex: search, $options: "i" };

  const cacheKey = cacheKeyFromQuery({ status, search });

  try {
    let todos = cache.get(cacheKey);
    const fromCache = Boolean(todos);

    if (!todos) {
      todos = await Todo.find(filter).sort({ createdAt: -1 });
      cache.set(cacheKey, todos);
    }

    renderWithFilters(res, "index", {
      todos,
      status,
      search,
      title: fromCache ? "Todo List (Cached)" : "Todo List",
    });
  } catch (error) {
    next(error);
  }
};

exports.addTodoForm = async (req, res) => {
  renderWithFilters(res, "add", {
    title: "Add Todo",
  });
};

exports.addTodo = async (req, res, next) => {
  try {
    await Todo.create({ title: req.body.title });
    cache.flushAll();
    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

exports.deleteTodo = async (req, res, next) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    cache.flushAll();
    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

exports.editTodoForm = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return renderWithFilters(res.status(404), "edit", {
        title: "Todo Not Found",
        todo: null,
      });
    }

    renderWithFilters(res, "edit", {
      title: "Edit Todo",
      todo,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTodo = async (req, res, next) => {
  try {
    const { title, status } = req.body;

    await Todo.findByIdAndUpdate(req.params.id, {
      title,
      status,
    });

    cache.flushAll();
    res.redirect("/");
  } catch (error) {
    next(error);
  }
};
