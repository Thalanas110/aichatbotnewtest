import { GoogleGenerativeAI } from "@google/generative-ai";
import * as readline from "readline";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const apiKey = process.env.GEMINI_API_KEY || "";

if (!apiKey) {
  console.error("❌ Error: GEMINI_API_KEY is not set!");
  console.error("Please create a .env file with your API key:");
  console.error("GEMINI_API_KEY=your_api_key_here");
  process.exit(1);
}

console.log("✓ API Key loaded successfully!");

const ai = new GoogleGenerativeAI(apiKey);

interface Message {
  role: "user" | "model";
  parts: string;
}

class Chatbot {
  private conversationHistory: Message[] = [];
  private rl: readline.Interface;
  private modelName = "models/gemini-2.5-flash";
  private model: any;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.model = ai.getGenerativeModel({ model: this.modelName });
  }

  private async chat(userMessage: string): Promise<string> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: "user",
        parts: userMessage,
      });

      // Prepare contents for API
      const contents = this.conversationHistory.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.parts }],
      }));

      const result = await this.model.generateContent({
        contents: contents,
      });

      const botResponse = result.response.text() || "I'm sorry, I couldn't generate a response.";

      // Add bot response to history
      this.conversationHistory.push({
        role: "model",
        parts: botResponse,
      });

      return botResponse;
    } catch (error) {
      console.error("Error during chat:", error);
      return "Sorry, I encountered an error. Please try again.";
    }
  }

  private getUserInput(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer: string) => {
        resolve(answer);
      });
    });
  }

  private async listAvailableModels(): Promise<void> {
    try {
      console.log("\n🔍 Fetching available models...\n");
      
      // List all available models
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data: any = await response.json();
      
      if (data.models && data.models.length > 0) {
        console.log("📋 Available Models:\n");
        console.log("─".repeat(80));
        
        data.models.forEach((model: any, index: number) => {
          console.log(`\n${index + 1}. Model: ${model.name}`);
          console.log(`   Display Name: ${model.displayName || "N/A"}`);
          console.log(`   Description: ${model.description || "N/A"}`);
          
          if (model.supportedGenerationMethods && model.supportedGenerationMethods.length > 0) {
            console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(", ")}`);
          }
          
          if (model.inputTokenLimit) {
            console.log(`   Input Token Limit: ${model.inputTokenLimit.toLocaleString()}`);
          }
          
          if (model.outputTokenLimit) {
            console.log(`   Output Token Limit: ${model.outputTokenLimit.toLocaleString()}`);
          }
        });
        
        console.log("\n" + "─".repeat(80));
        console.log(`\n✅ Total models found: ${data.models.length}`);
        console.log(`🔧 Currently using: ${this.modelName}\n`);
      } else {
        console.log("No models found.");
      }
    } catch (error) {
      console.error("❌ Error fetching models:", error);
    }
  }

  public async start(): Promise<void> {
    console.log("=================================");
    console.log("  Welcome to AI Chatbot! 🤖");
    console.log("=================================");
    console.log("Type 'exit', 'quit', or 'bye' to end the conversation");
    console.log("Type 'clear' to clear conversation history");
    console.log("Type 'history' to view conversation history");
    console.log("Type 'models' to list available AI models");
    console.log("=================================\n");

    let running = true;

    while (running) {
      const userInput = await this.getUserInput("You: ");
      const trimmedInput = userInput.trim();

      if (!trimmedInput) {
        continue;
      }

      const lowerInput = trimmedInput.toLowerCase();

      // Handle commands
      if (lowerInput === "exit" || lowerInput === "quit" || lowerInput === "bye") {
        console.log("\nBot: Goodbye! Have a great day! 👋\n");
        running = false;
        break;
      }

      if (lowerInput === "clear") {
        this.conversationHistory = [];
        console.log("\nBot: Conversation history cleared!\n");
        continue;
      }

      if (lowerInput === "history") {
        console.log("\n--- Conversation History ---");
        if (this.conversationHistory.length === 0) {
          console.log("No messages yet.");
        } else {
          this.conversationHistory.forEach((msg, index) => {
            const speaker = msg.role === "user" ? "You" : "Bot";
            console.log(`${index + 1}. ${speaker}: ${msg.parts}`);
          });
        }
        console.log("---------------------------\n");
        continue;
      }

      if (lowerInput === "models") {
        await this.listAvailableModels();
        continue;
      }

      // Get bot response
      const response = await this.chat(trimmedInput);
      console.log(`\nBot: ${response}\n`);
    }

    this.rl.close();
  }
}

async function main() {
  const chatbot = new Chatbot();
  await chatbot.start();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});