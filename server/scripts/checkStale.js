import { getCollection } from "../services/embeddingService.js";

const collection = await getCollection();
const results = await collection.get({});

const suspicious = results.documents
  .map((doc, i) => ({ id: results.ids[i], doc, metadata: results.metadatas[i] }))
  .filter((item) => item.doc.toLowerCase().includes("oats") || item.doc.toLowerCase().includes("nirvana") || item.doc.toLowerCase().includes("saffron"));

console.log(`Total entries in ChromaDB: ${results.ids.length}`);
console.log(`Suspicious matches found: ${suspicious.length}`);
suspicious.forEach((s) => console.log("─", s.id, "→", s.doc.substring(0, 100)));

process.exitCode = 0;