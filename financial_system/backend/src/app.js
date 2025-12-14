const express = require("express");
const cors = require("cors");
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Shared expenses API" });
});

app.use("/api", expenseRoutes);

app.use((req, res, next) => {
  const error = new Error(`Not Found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Unexpected error",
  });
});

module.exports = app;
