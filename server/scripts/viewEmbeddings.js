import { getCollection } from "../services/embeddingService.js";

const collection = await getCollection();

// adjust limit as needed (ex: 20, 50, 100)
const results = await collection.get({
  limit: 20,
});

console.log(`Total entries shown: ${results.ids.length}\n`);

results.ids.forEach((id, i) => {
  console.log("─────────────────────────────");
  console.log("ID:", id);
  console.log("Type:", results.metadatas[i]?.type);
  console.log("Text stored:", results.documents[i]);
});

process.exitCode = 0;