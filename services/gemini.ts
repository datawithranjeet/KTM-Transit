
import { GoogleGenAI } from "@google/genai";
import { RouteData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchRouteDetails = async (query: string): Promise<RouteData> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are an intelligent transit assistant for Kathmandu Valley.
        The user is searching for bus route information for: "${query}".

        Task:
        1. Identify the bus route, key stops, and schedule.
        2. Use Google Maps to verify stop locations and assess current or typical traffic conditions for this route in Kathmandu.
        3. Provide a traffic condition assessment (Light, Moderate, or Heavy) and a brief analysis.
        4. Return the result as a raw, valid JSON object. Do not wrap in markdown code blocks.

        JSON Structure:
        {
          "busNumber": "string",
          "routeName": "string",
          "description": "string",
          "frequencyMinutes": number,
          "firstBusTime": "HH:MM",
          "lastBusTime": "HH:MM",
          "trafficCondition": "Light" | "Moderate" | "Heavy",
          "trafficAnalysis": "string (brief explanation of traffic state)",
          "stops": [
            {
              "id": number,
              "name": "string",
              "distanceFromPreviousKm": number,
              "typicalTravelTimeMinutes": number,
              "landmark": "string or null"
            }
          ]
        }
        
        Ensure at least 8-10 major stops.
      `,
      config: {
        tools: [{ googleMaps: {} }],
        // responseSchema and responseMimeType are not supported when using tools in this context for some models, 
        // relying on prompt for JSON structure.
      },
    });

    let text = response.text || "";
    // Clean potential markdown code blocks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    if (!text) throw new Error("No response from Gemini");

    let data: RouteData;
    try {
      data = JSON.parse(text) as RouteData;
    } catch (e) {
      console.error("Failed to parse JSON:", text);
      throw new Error("Received invalid data format from AI.");
    }

    // Extract Grounding Metadata (Source URLs)
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls: string[] = [];

    chunks.forEach((chunk: any) => {
      // Maps grounding chunks often have 'maps' property or 'web' property
      if (chunk.maps?.uri) urls.push(chunk.maps.uri);
      if (chunk.web?.uri) urls.push(chunk.web.uri);
    });

    data.sourceUrls = [...new Set(urls)]; // Remove duplicates

    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch route details. Please try again.");
  }
};

export const generateCrowdData = async (routeName: string) => {
    // Helper to generate chart data separately to keep main prompt clean or just mock it for UI speed if preferred.
    // We will generate simple mock data here for speed as it's purely visual estimation.
    const data = [];
    for (let i = 6; i <= 20; i++) {
        let level = 30;
        if (i >= 8 && i <= 10) level = 90; // Morning rush
        if (i >= 16 && i <= 18) level = 95; // Evening rush
        if (i === 12) level = 50;
        
        // Add some randomness
        level = Math.min(100, Math.max(10, level + (Math.random() * 20 - 10)));
        
        data.push({
            hour: `${i}:00`,
            level: Math.round(level)
        });
    }
    return data;
}
