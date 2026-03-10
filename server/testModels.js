require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listAllModels() {
  try {
    console.log(
      "Checking API Key: ",
      process.env.GEMINI_API_KEY.substring(0, 5) + "...",
    );

    // Google se available models ki list mangwana
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
    );
    const data = await response.json();

    if (data.models) {
      console.log("\n✅ Bhai, ye models tere liye available hain:");
      data.models.forEach((m) => {
        console.log(`- ${m.name.replace("models/", "")} (${m.displayName})`);
      });
      console.log(
        "\nInme se koi bhi naam 'mockRoutes.js' mein copy-paste kardo.",
      );
    } else {
      console.log(
        "❌ Error: Models list nahi mili. Check API Key permissions.",
      );
      console.log(data);
    }
  } catch (err) {
    console.error("❌ Critical Error:", err.message);
  }
}

listAllModels();
