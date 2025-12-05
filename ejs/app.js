require("dotenv").config();
const path = require("path");
const express = require("express");
const layouts = require("express-ejs-layouts");
const connectDB = require("./config/db");
const todoRoutes = require("./routes/todoRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(layouts);
app.set("layout", "layout");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.year = new Date().getFullYear();
  next();
});

app.use("/", todoRoutes);

app.use((req, res) => {
  res.status(404).render("error", {
    title: "صفحه پیدا نشد",
    message: "متاسفانه صفحه موردنظر وجود ندارد.",
  });
});

app.use((err, req, res, next) => {
  console.error("Unexpected error", err);
  res.status(500).render("error", {
    title: "خطای داخلی",
    message: "در پردازش درخواست مشکلی پیش آمد. لطفا دوباره تلاش کنید.",
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = { app, server };
