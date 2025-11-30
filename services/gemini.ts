import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, NewsItem, StockData } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const searchStock = async (symbol: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const model = "gemini-2.5-flash";
  const prompt = `
    Find the real-time stock price and latest market news for ${symbol}.
    
    I need you to output a structured summary that I can parse programmatically, followed by a human-readable analysis.
    
    STRICTLY follow this format for the first part of your response:
    ||SYMBOL: <ticker symbol>||
    ||NAME: <company name>||
    ||PRICE: <current numeric price, no currency symbol>||
    ||CURRENCY: <currency code like USD>||
    ||CHANGE: <percentage change today, numeric only>||
    ||MARKETCAP: <market cap string>||
    ||SENTIMENT: <bullish, bearish, or neutral>||
    
    After these tags, provide a concise paragraph analyzing why the stock is moving today.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // We cannot use JSON schema with googleSearch, so we parse text manually
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Parse specific tags
    const stockData = parseStockData(text, symbol);
    
    // Extract News from Grounding
    const news: NewsItem[] = groundingChunks
      .filter((c: any) => c.web)
      .map((c: any) => ({
        title: c.web.title,
        url: c.web.uri,
        source: new URL(c.web.uri).hostname.replace('www.', ''),
      }))
      // Deduplicate by URL
      .filter((item: NewsItem, index: number, self: NewsItem[]) => 
        index === self.findIndex((t) => t.url === item.url)
      )
      .slice(0, 5);

    return {
      stockData,
      news,
      rawText: text,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

const parseStockData = (text: string, originalSymbol: string): StockData | null => {
  const extract = (key: string) => {
    const regex = new RegExp(`\\|\\|${key}:\\s*(.*?)\\|\\|`);
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  const priceStr = extract("PRICE");
  const changeStr = extract("CHANGE");
  const symbol = extract("SYMBOL") || originalSymbol.toUpperCase();
  const name = extract("NAME") || symbol;
  const currency = extract("CURRENCY") || "USD";
  const marketCap = extract("MARKETCAP") || "N/A";
  const sentimentRaw = extract("SENTIMENT")?.toLowerCase() || "neutral";

  // If we couldn't parse the price, the search might have failed to be specific
  if (!priceStr) return null;

  // Clean up price string (remove commas)
  const price = parseFloat(priceStr.replace(/,/g, ''));
  const changePercent = parseFloat(changeStr?.replace('%', '') || "0");

  let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (sentimentRaw.includes('bull')) sentiment = 'bullish';
  if (sentimentRaw.includes('bear')) sentiment = 'bearish';

  // Extract the summary (everything after the tags)
  // We assume the tags appear early. We'll clean tags out for the display summary.
  let summary = text.replace(/\|\|.*?:.*?\|\|/g, '').trim();
  // Remove any leftover newlines or weird spacing
  summary = summary.replace(/\n\s*\n/g, '\n').trim();

  return {
    symbol,
    companyName: name,
    price,
    currency,
    changePercent,
    marketCap,
    sentiment,
    summary,
    lastUpdated: new Date(),
  };
};
