const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyDW7ZRHZfS5SRw7yGrKAKeWFR-Ar4Xc5Xo";
const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
  try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent("Hello");
      console.log("Gemini-pro works:", result.response.text());
  } catch (e) {
      console.log("Gemini-pro failed:", e.message);
  }

  try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent("Hello");
      console.log("Gemini-1.5-flash works:", result.response.text());
  } catch (e) {
      console.log("Gemini-1.5-flash failed:", e.message);
  }
}

test();
