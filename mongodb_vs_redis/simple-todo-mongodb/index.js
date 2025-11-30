require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());

let db;
const client = new MongoClient(process.env.MONGODB_URI, {
  // options if needed
});

async function start() {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME || "todo_db");
    console.log("Connected to MongoDB Atlas");
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

// CREATE
app.post("/todos", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    // generate simple numeric id
    const count = await db.collection("todos").countDocuments();
    const newId = (count + 1).toString(); // "1", "2", "3"...

    const doc = {
      _id: newId,
      title,
      completed: false,
      createdAt: new Date(),
    };

    await db.collection("todos").insertOne(doc);

    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// READ ALL
app.get("/todos", async (req, res) => {
  try {
    const todos = await db
      .collection("todos")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    // Convert _id to string for readability
    const out = todos.map(t => ({ ...t, _id: t._id.toString() }));
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// UPDATE
app.put("/todos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { title, completed } = req.body;

    const update = {};
    if (title !== undefined) update.title = title;
    if (completed !== undefined) update.completed = completed;

    const result = await db.collection("todos").findOneAndUpdate(
      { _id: id },    // id is string now
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result.value) return res.status(404).json({ error: "Todo not found" });

    res.json(result.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// DELETE
app.delete("/todos/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await db.collection("todos").deleteOne({ _id: id });

    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Todo not found" });

    res.json({ message: "Todo deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  try {
    await client.close();
  } catch (e) {}
  process.exit(0);
});

start();
