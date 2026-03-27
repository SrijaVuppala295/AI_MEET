/**
 * Rotates through multiple API keys to avoid rate limits.
 * Expected environment variables:
 * GROQ_API_KEY_1="key"
 * OPENROUTER_API_KEY1="key"
 */

export type Provider = "groq" | "openrouter";

let groqIndex = 0;
let openRouterIndex = 0;

export function getNextApiKey(provider: Provider): string {
  // We must statically access process.env.NEXT_PUBLIC_ for client-side bundle replacements in Next.js
  const groqKeys = [
    process.env.NEXT_PUBLIC_GROQ_API_KEY, process.env.NEXT_PUBLIC_GROQ_API_KEY_1,
    process.env.NEXT_PUBLIC_GROQ_API_KEY_2, process.env.NEXT_PUBLIC_GROQ_API_KEY_3,
    process.env.NEXT_PUBLIC_GROQ_API_KEY_4, process.env.NEXT_PUBLIC_GROQ_API_KEY_5,
    process.env.NEXT_PUBLIC_GROQ_API_KEY_6, process.env.NEXT_PUBLIC_GROQ_API_KEY_7,
    process.env.NEXT_PUBLIC_GROQ_API_KEY_8, process.env.NEXT_PUBLIC_GROQ_API_KEY_9,
    process.env.NEXT_PUBLIC_GROQ_API_KEY_10, process.env.NEXT_PUBLIC_GROQ_API_KEY_11,
    process.env.NEXT_PUBLIC_GROQ_API_KEY_12, process.env.NEXT_PUBLIC_GROQ_API_KEY_13,
    process.env.NEXT_PUBLIC_GROQ_API_KEY_14, process.env.NEXT_PUBLIC_GROQ_API_KEY_15
  ].filter(Boolean) as string[];

  const orKeys = [
    process.env.NEXT_PUBLIC_OPENROUTER_API_KEY1, process.env.NEXT_PUBLIC_OPENROUTER_API_KEY2,
    process.env.NEXT_PUBLIC_OPENROUTER_API_KEY3, process.env.NEXT_PUBLIC_OPENROUTER_API_KEY4,
    process.env.NEXT_PUBLIC_OPENROUTER_API_KEY5, process.env.NEXT_PUBLIC_OPENROUTER_API_KEY6,
  ].filter(Boolean) as string[];

  const keys = provider === "groq" ? groqKeys : orKeys;
  if (keys.length === 0) return "";

  if (provider === "groq") { return keys[groqIndex++ % keys.length]; }
  else { return keys[openRouterIndex++ % keys.length]; }
}

export function getNextApiKeyServer(provider: Provider): string {
  // Server-side can technically use dynamic objects, but we'll reflect client logic for safety
  const groqKeys = [
    process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_1, process.env.GROQ_API_KEY_2, 
    process.env.GROQ_API_KEY_3, process.env.GROQ_API_KEY_4, process.env.GROQ_API_KEY_5,
    process.env.GROQ_API_KEY_6, process.env.GROQ_API_KEY_7, process.env.GROQ_API_KEY_8, 
    process.env.GROQ_API_KEY_9, process.env.GROQ_API_KEY_10, process.env.GROQ_API_KEY_11,
    process.env.GROQ_API_KEY_12, process.env.GROQ_API_KEY_13, process.env.GROQ_API_KEY_14, 
    process.env.GROQ_API_KEY_15
  ].filter(Boolean) as string[];

  const orKeys = [
    process.env.OPENROUTER_API_KEY1, process.env.OPENROUTER_API_KEY2,
    process.env.OPENROUTER_API_KEY3, process.env.OPENROUTER_API_KEY4,
    process.env.OPENROUTER_API_KEY5, process.env.OPENROUTER_API_KEY6,
  ].filter(Boolean) as string[];

  const keys = provider === "groq" ? groqKeys : orKeys;
  if (keys.length === 0) return "";

  return keys[Math.floor(Math.random() * keys.length)];
}
