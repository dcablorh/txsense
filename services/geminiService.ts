
import { GoogleGenAI } from "@google/genai";
import { SuiTransactionBlockResponse, PackageExplanationResult, CoinMetadata, InvolvedParty } from '../types';
import { KNOWN_PACKAGES } from '../constants';

export const generateExplanation = async (
  txData: SuiTransactionBlockResponse, 
  coinMetadata: Record<string, CoinMetadata>
): Promise<{ 
  summary: string, 
  technicalPlayByPlay: string,
  mermaidCode?: string, 
  protocol?: string, 
  actionType?: string,
  involvedParties?: InvolvedParty[]
}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const knownPackageInfo = KNOWN_PACKAGES.map(p => `${p.id} is ${p.name}`).join(', ');
  
  const tokenContext = Object.values(coinMetadata).map(m => 
    `${m.id} is "${m.name}" (${m.symbol}) with ${m.decimals} decimals.`
  ).join('\n');

  const prompt = `
    Analyze this Sui transaction and generate a "TxSense Report". 
    
    Data: ${JSON.stringify(txData)}
    Known Packages: ${knownPackageInfo}
    Token Metadata: ${tokenContext}
    
    Instructions:
    1. SUMMARY: Provide a single direct sentence in plain language describing the main intent. 

    2. TECHNICAL BREAKDOWN (technicalPlayByPlay): 
       Write a high-fidelity narrative paragraph explaining the flow. 
       
       STRICT UNIT RULES:
       - NEVER use the word "MIST".
       - NEVER use raw unscaled integers for token amounts (e.g., DO NOT write "30,000,000").
       - ALWAYS convert to decimal-scaled values using the provided decimals (e.g., "0.03 SUI", "1.5 USDC").
       - Use 👤 for Sender, 🏦 for Protocol, and 🪙 for Token movements.

    3. INVOLVED PARTIES:
       Identify EVERY address taking part in this transaction. 
       Return an array of objects with "address", "role" (e.g., "Sender", "Recipient", "Liquidity Pool", "Market Maker", "Package Owner"), and "label" (a friendly name if identifiable, otherwise null).

    4. MERMAID CODE:
       Generate a Mermaid "graph LR" chart. Use quoted labels: NodeID["Label Text"].
       NO MIST. ONLY SCALED DECIMALS.

    Return a JSON object: 
    {
      "summary": "Plain language summary",
      "technicalPlayByPlay": "Narrative with ONLY scaled decimals",
      "mermaidCode": "Mermaid string",
      "protocol": "DApp name",
      "actionType": "Action type",
      "involvedParties": [{"address": "0x...", "role": "Role Name", "label": "Friendly Name"}]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        systemInstruction: "You are 'TxSense', an elite Sui blockchain analyst. You decode transactions into plain english. You strictly use decimal-scaled amounts (never MIST). You identify all addresses and their specific roles in the transaction ecosystem. Ensure Mermaid syntax is valid with double-quoted labels."
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return { 
      summary: "A transaction occurred on the Sui network.",
      technicalPlayByPlay: "The transaction was processed successfully, updating internal state objects and consuming a small amount of SUI for network fees."
    };
  }
};

export const generatePackageExplanation = async (packageId: string, modules: any): Promise<PackageExplanationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze this Sui Package (${packageId}).
    Modules: ${Object.keys(modules).join(', ')}
    Identify the purpose and return JSON: { "summary": "string", "modules": ["string"], "capabilities": ["string"] }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        systemInstruction: "You are a Sui code analyst. You explain smart contracts simply."
      }
    });
    const parsed = JSON.parse(response.text || '{}');
    return {
      packageId,
      summary: parsed.summary || "Move code package enabling specific functionality.",
      modules: parsed.modules || Object.keys(modules),
      capabilities: parsed.capabilities || ["Smart Contract Actions"]
    };
  } catch (error) {
    return { packageId, summary: "Contract analysis failed.", modules: Object.keys(modules), capabilities: [] };
  }
};
