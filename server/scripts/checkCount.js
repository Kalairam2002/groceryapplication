import { getCollection } from "../services/embeddingService.js";

const c = await getCollection();
console.log("Total vectors in collection:", await c.count());
process.exitCode = 0;