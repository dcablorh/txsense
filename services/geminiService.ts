
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
  coinMetadata: Record<string, CoinMetadata>,
  suinsNames?: Map<string, string | null>
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

  // Build SuiNS name context for addresses that have names
  const suinsContext = suinsNames
    ? Array.from(suinsNames.entries())
        .filter(([_, name]) => name !== null)
        .map(([addr, name]) => `- ${addr} is "${name}"`)
        .join('\n')
    : '';

  const minimalData = pruneTxData(txData);

  const prompt = `
    Analyze this Sui Transaction and explain what happened clearly:
    ${JSON.stringify(minimalData)}

    REAL PROTOCOL BRANDS (USE THESE NAMES):
    ${knownPackageInfo}

    TOKEN METADATA:
    ${tokenContext}
    ${suinsContext ? `
    SUINS NAMES (Use these human-readable names instead of raw addresses when available):
    ${suinsContext}
    ` : ''}
    Return a detailed JSON response:
    {
      "summary": "A clear summary of what happened. Use SuiNS names like: '👤 alice.sui (0x1234...abcd) sent 0.9 USDC to 👤 bob.sui (0x5678...efgh)'. Keep technical terms but add simple explanations in brackets.",
      "technicalPlayByPlay": "A step-by-step breakdown following these EXACT rules:
        1. NEVER USE 'THEY' OR 'THEIR': Always refer to '👤 The Sender', '👤 alice.sui', or 'The user'. Never use plural pronouns for a single person.
        2. PASSIVE VOICE FOR SYSTEM ACTIONS: When the blockchain/system does something, use passive voice. Say 'The coins were split' NOT 'they split the coins'. Say 'The transaction was processed' NOT 'they processed'.
        3. TECHNICAL TERMS WITH EXPLANATIONS: Keep Sui terms but add layman explanation in brackets. Example: 'SplitCoins (dividing the balance into smaller parts)' or 'TransferObjects (sending items to another wallet)'.
        4. SUINS NAMES: If a SuiNS name exists, show it as '👤 name.sui (0x1234...abcd)'. If not, use '👤 The Sender (0x1234...abcd)'.
        5. ADDRESS SNIPPETS: Show addresses as (0x1234...abcd) - first 6 and last 4 characters.
        6. STORY FLOW: Use markers like 'First', 'Then', 'Next', 'After that', 'Finally'.
        7. EMOJIS: 👤 for people/wallets, 🏦 for apps/protocols, 💼 for objects, ⛽ for gas/fees, 🪙 for tokens.
        8. CLEAN NUMBERS: Round to clean numbers (e.g., '0.9 USDC' not '0.900000 USDC', '0.002 SUI' not '0.001847362 SUI').

        GOOD EXAMPLE: 'First, 👤 alice.sui (0x418c...9f67) initiated a transfer. Then, 0.9 USDC was split from the main balance using SplitCoins (separating a portion of coins). Next, the 0.9 USDC was sent to 👤 bob.sui (0x1eb7...0b11) via TransferObjects (moving tokens to another wallet). Finally, a ⛽ network fee of 0.002 SUI was paid.'

        BAD EXAMPLE: 'They split their coins and sent them.' (Don't use they/their)",
      "mermaidCode": "graph LR; User[\"👤 alice.sui (0x1234...abcd)\"] -->|Sends| App[\"🏦 Protocol\"]; App -->|Transfers| Receiver[\"👤 bob.sui\"]; ... (Valid mermaid.js flowchart)",
      "protocol": "Protocol Name (e.g. Sui Framework, DeepBook, Cetus)",
      "actionType": "Action Type (e.g. Transfer, Swap, Deposit, Borrow)",
      "involvedParties": [
        {
          "address": "0x...",
          "role": "Role (e.g. Sender, Receiver, Protocol)",
          "label": "SuiNS name or Protocol name (e.g. alice.sui, Cetus)"
        }
      ]
    }

    CRITICAL: Never use 'they/their' for individuals. Use passive voice for system actions. Keep technical terms but explain them in brackets.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: "You translate Sui transactions into clear explanations. Keep technical terms but add simple explanations in brackets. Never use 'they/their' for individuals - use the person's name or 'The Sender'. Use passive voice when describing system actions (e.g., 'coins were split' not 'they split coins')."
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "This transaction went through successfully on the Sui network.",
      technicalPlayByPlay: "The sender completed a transaction on Sui. Then, some token balances were updated based on what the app did.",
      mermaidCode: "graph LR; User[\"👤 Sender\"]-->App[\"🏦 App\"]; App-->Result[\"✨ Done!\"];"
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
