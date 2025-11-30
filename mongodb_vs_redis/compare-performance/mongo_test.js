require("dotenv").config();
const { MongoClient } = require("mongodb");

async function testMongo() {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();

  const dbName = process.env.DB_NAME || "todo_db";
  const db = client.db(dbName);
  const col = db.collection("perf_todos");

  console.log("Testing MongoDB with string IDs...");

  // Clean up collection first
  try {
    await col.deleteMany({});
  } catch (e) {}

  const numItems = 1000; // تعداد آیتم‌ها برای تست
  const dataTemplate = { title: "todo item", completed: false };

  // Insert items
  let start = Date.now();
  for (let i = 1; i <= numItems; i++) {
    const doc = { _id: i.toString(), ...dataTemplate, createdAt: new Date() };
    await col.insertOne(doc);
  }
  let end = Date.now();
  console.log("MongoDB Insert Time:", end - start, "ms");

  // Read items
  start = Date.now();
  const items = await col.find({}).toArray();
  end = Date.now();
  console.log("MongoDB Read Time:", end - start, "ms");

  console.log("Total items read:", items.length);

  // Optional: clean up after test
  await col.deleteMany({});
  await client.close();
  console.log("Test finished and collection cleaned up.");
}

testMongo().catch(err => {
  console.error(err);
  process.exit(1);
});
