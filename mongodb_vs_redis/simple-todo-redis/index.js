require("dotenv").config();
const express = require("express");
const { createClient } = require("redis");

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());

// Redis client
const client = createClient({ url: process.env.REDIS_URL });

client.on("error", (err) => console.error("Redis error:", err));

async function start() {
  try {
    await client.connect();
    console.log("Connected to Redis");
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    process.exit(1);
  }
}

// CREATE
app.post("/todos", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const id = await client.incr("todo:id"); // auto-increment
    const todo = {
      id,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    await client.set(`todo:${id}`, JSON.stringify(todo));
    await client.rPush("todo:ids", id.toString());

    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// READ ALL
app.get("/todos", async (req, res) => {
  try {
    const ids = await client.lRange("todo:ids", 0, -1);
    const todos = [];
    for (const id of ids) {
      const data = await client.get(`todo:${id}`);
      if (data) todos.push(JSON.parse(data));
    }
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// UPDATE
app.put("/todos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const old = await client.get(`todo:${id}`);
    if (!old) return res.status(404).json({ error: "Todo not found" });

    const { title, completed } = req.body;
    const updated = { ...JSON.parse(old) };
    if (title !== undefined) updated.title = title;
    if (completed !== undefined) updated.completed = completed;

    await client.set(`todo:${id}`, JSON.stringify(updated));
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE
app.delete("/todos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await client.del(`todo:${id}`);
    if (deleted === 0) return res.status(404).json({ error: "Todo not found" });

    await client.lRem("todo:ids", 1, id);
    res.json({ message: "Todo deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  try {
    await client.quit();
  } catch (e) {}
  process.exit(0);
});

start();
