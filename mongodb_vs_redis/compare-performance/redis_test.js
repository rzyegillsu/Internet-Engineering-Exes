require("dotenv").config();
const { createClient } = require("redis");

async function testRedis() {
  const client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: retries => Math.min(retries * 50, 5000)
    }
  });

  client.on("error", err => console.error("Redis error:", err));

  await client.connect();
  console.log("Testing Redis...");

  const data = { title: "todo item" };
  const numItems = 1000;
  const batchSize = 50;  // تعداد آیتم‌ها در هر batch
  const delayMs = 50;    // تاخیر بین batch‌ها برای جلوگیری از throttling

  // پاک کردن کلیدهای قبلی (در prod مراقب باش)
  try {
    await client.del("perf:ids");
    for (let i = 0; i < numItems; i++) {
      await client.del(`perf:todo:${i}`);
    }
  } catch (e) {}

  // Insert items با batch
  let start = Date.now();
  for (let i = 0; i < numItems; i++) {
    await client.set(`perf:todo:${i}`, JSON.stringify(data));
    await client.rPush("perf:ids", i.toString());

    if ((i + 1) % batchSize === 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  let end = Date.now();
  console.log("Redis Insert Time:", end - start, "ms");

  // Read items با batch
  start = Date.now();
  const ids = await client.lRange("perf:ids", 0, -1);
  for (let i = 0; i < ids.length; i++) {
    await client.get(`perf:todo:${ids[i]}`);
    if ((i + 1) % batchSize === 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  end = Date.now();
  console.log("Redis Read Time:", end - start, "ms");

  console.log("Total items read:", ids.length);

  await client.quit();
  console.log("Test finished and Redis cleaned up.");
}

testRedis().catch(err => {
  console.error(err);
  process.exit(1);
});
