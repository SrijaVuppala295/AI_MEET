const fetch = require("node-fetch"); // May need to use dynamic import if it's ESM, or just use native fetch if node is recent

const API_KEY = "AIzaSyDW7ZRHZfS5SRw7yGrKAKeWFR-Ar4Xc5Xo";

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    console.log("Available models:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("Fetch failed:", e.message);
  }
}

listModels();
