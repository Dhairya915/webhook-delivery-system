import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function generateFailureSummary(responseCode: number, attempts: number, url: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
  
  const prompt = `Webhook delivery failed after ${attempts} attempts to ${url}, last response code ${responseCode}. Explain the likely cause in one sentence.`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}