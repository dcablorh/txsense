
import { GoogleGenAI } from "@google/genai";
import { SuiTransactionBlockResponse, PackageExplanationResult, CoinMetadata, InvolvedParty } from '../types';
import { KNOWN_PACKAGES } from '../constants';

/**
 * Extracts narrative-critical data points while stripping
 * the noise of internal Move bytecodes and metadata.
 */
const pruneTxData = (txData: SuiTransactionBlockResponse) => {
  return {
    digest: txData.digest,
    sender: txData.transaction?.data.sender,
    gasPayer: txData.transaction?.data.gasData.owner,
    gasBudget: txData.transaction?.data.gasData.budget,
    gasUsed: txData.effects?.gasUsed,
    commands: txData.transaction?.data.transaction.kind === 'ProgrammableTransaction' 
      ? (txData.transaction.data.transaction as any).transactions?.map((t: any) => ({
          type: Object.keys(t)[0],
          call: t.MoveCall ? {
            package: t.MoveCall.package,
            module: t.MoveCall.module,
            function: t.MoveCall.function
          } : null
        })).slice(0, 15)
      : txData.transaction?.data.transaction.kind,
    balanceChanges: txData.balanceChanges?.map(bc => ({
      coinType: bc.coinType,
      amount: bc.amount,
      owner: typeof bc.owner === 'object' ? Object.values(bc.owner)[0] : bc.owner
    })).slice(0, 12),
    events: txData.events?.map(e => ({
      type: e.type.split('::').pop(),
      parsed: e.parsedJson
    })).slice(0, 10),
    status: txData.effects?.status.status
  };
};

export const generateExplanation = async (
  txData: SuiTransactionBlockResponse, 
  coinMetadata: Record<string, CoinMetadata>
): Promise<{ 
  summary: string, 
  technicalPlayByPlay: string,
  mermaidCode: string, 
  protocol?: string, 
  actionType?: string,
  involvedParties?: InvolvedParty[]
}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const knownPackageInfo = KNOWN_PACKAGES.map(p => `- ID ${p.id} is the "${p.name}" protocol`).join('\n');
  const tokenContext = Object.values(coinMetadata).map(m => 
    `${m.id}: ${m.symbol} (decimals: ${m.decimals})`
  ).join('\n');

  const minimalData = pruneTxData(txData);

  const prompt = `
    Analyze this Sui Transaction and generate a high-fidelity, professional auditor report:
    ${JSON.stringify(minimalData)}

    REAL PROTOCOL BRANDS (USE THESE NAMES):
    ${knownPackageInfo}

    TOKEN METADATA:
    ${tokenContext}
    
    Return a detailed JSON response:
    {
      "summary": "A formal executive summary in 3rd person (e.g., 'The 👤 Sender (0x...) performed a liquidity addition to the Cetus SUI/USDC pool').",
      "technicalPlayByPlay": "A deep narrative Technical Breakdown following these EXACT rules:
        1. PERSPECTIVE: ABSOLUTELY 3rd person only. Never use 'You'. Use 'The 👤 Sender (0x...)', 'The user', or 'The protocol'.
        2. ADDRESS SNIPPETS: Always include the first 5 characters of addresses in parentheses, like (0x123ab...).
        3. SEQUENCE MARKERS: Every step MUST start with markers like 'First', 'Subsequently', 'Following this', or 'Finally' to show the logical chain.
        4. EMOJIS: Use emojis for actors: 👤 Sender, 🏦 Protocol/Pool, 💼 Manager/Object, ⛽ Gas Payer, 🪙 Token.
        5. ROUNDING & UNITS: NEVER include small units like MIST. ALWAYS round amounts to clean, human-readable large units (e.g., '5.0 SUI' instead of '5.000000001 SUI' or '5,000,000,000 MIST'). If an amount is very small dust, describe it as 'a nominal amount'. Round to 2 or 3 significant figures.
        6. MOVE LOGIC: Reference specific Move function names from the commands list.",
      "mermaidCode": "graph LR; User[\"👤 Sender (0x...)\"] -->|Calls Function| App[\"🏦 Protocol Name\"]; App -->|Updates| Obj[\"💼 Object (0x...)\"]; ... (Valid mermaid.js code flowchart)",
      "protocol": "Main Brand Name (e.g. DeepBook, Cetus, Aftermath, Scallop)",
      "actionType": "Action Category (e.g. Swap, Liquidity, Borrow, Flash Loan)",
      "involvedParties": [
        {
          "address": "0x...", 
          "role": "Role (e.g. Sender, Gas Payer, Liquidity Pool)", 
          "label": "REAL BRAND NAME (e.g. DeepBook V3, User Wallet)"
        }
      ]
    }
    
    CRITICAL: Tone must be authoritative and forensic. No fluff. Accurate branding is mandatory.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: "You are a senior blockchain forensic auditor. You translate technical Sui transaction data into professional 3rd-person reports. You prioritize branding, sequence of events, and large-unit rounding for tokens."
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return { 
      summary: "Transaction analysis completed.",
      technicalPlayByPlay: "The sender successfully interacted with the Sui network. Subsequently, token balances were adjusted according to the protocol logic.",
      mermaidCode: "graph LR; User[\"👤 Sender\"]-->Protocol[\"🏦 Protocol\"]; Protocol-->Result[\"✨ Success\"];"
    };
  }
};

export const generatePackageExplanation = async (packageId: string, modules: any): Promise<PackageExplanationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze Sui Package (${packageId}). Modules: ${Object.keys(modules).join(', ')}.
    JSON: { "summary": "Detailed summary in simple english", "modules": ["string"], "capabilities": ["string"] }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    const parsed = JSON.parse(response.text || '{}');
    return {
      packageId,
      summary: parsed.summary || "This is a smart contract package on the Sui network.",
      modules: parsed.modules || Object.keys(modules),
      capabilities: parsed.capabilities || ["App Logic"]
    };
  } catch (error) {
    return { packageId, summary: "Analysis failed.", modules: Object.keys(modules), capabilities: [] };
  }
};
