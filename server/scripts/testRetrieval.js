import { queryDocuments } from "../services/embeddingService.js";

const results = await queryDocuments("I want to make a spicy curry, what do you suggest?", 5);

results.documents[0].forEach((doc, i) => {
  console.log(`Match ${i + 1}:`);
  console.log(doc.substring(0, 200));
  console.log("---");
});

process.exitCode = 0;