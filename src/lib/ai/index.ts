import { generateText, streamText, type CoreMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAI as createDeepSeek } from "@ai-sdk/openai";
import { logger } from "@/lib/logger";

export type AIProvider = "openai" | "deepseek";

export interface AIGenerateOptions {
  prompt: string;
  system?: string;
  messages?: CoreMessage[];
  model?: string;
  provider?: AIProvider;
  temperature?: number;
  maxTokens?: number;
}

export interface AIStreamOptions extends AIGenerateOptions {
  onChunk?: (text: string) => void;
  onFinish?: (text: string) => void;
}

/**
 * 获取模型实例
 */
function getModel(provider: AIProvider = "openai", modelName?: string) {
  switch (provider) {
    case "deepseek": {
      const deepseek = createDeepSeek({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: "https://api.deepseek.com/v1",
      });
      return deepseek(modelName || "deepseek-chat");
    }
    case "openai":
    default: {
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      return openai(modelName || "gpt-4o-mini");
    }
  }
}

/**
 * 非流式生成文本
 */
export async function aiGenerate(options: AIGenerateOptions) {
  const {
    prompt,
    system,
    messages,
    model,
    provider = "openai",
    temperature = 0.7,
    maxTokens,
  } = options;

  const modelName = model || (provider === "deepseek" ? "deepseek-chat" : "gpt-4o-mini");
  logger.info(`AI generate: provider=${provider}, model=${modelName}`);

  const result = await generateText({
    model: getModel(provider, modelName),
    prompt,
    system,
    messages,
    temperature,
    maxTokens,
  });

  return result.text;
}

/**
 * 流式生成文本，返回 ReadableStream
 */
export function aiStream(options: AIStreamOptions) {
  const {
    prompt,
    system,
    messages,
    model,
    provider = "openai",
    temperature = 0.7,
    maxTokens,
    onFinish,
  } = options;

  const modelName = model || (provider === "deepseek" ? "deepseek-chat" : "gpt-4o-mini");
  logger.info(`AI stream: provider=${provider}, model=${modelName}`);

  const result = streamText({
    model: getModel(provider, modelName),
    prompt,
    system,
    messages,
    temperature,
    maxTokens,
    onFinish: ({ text }) => {
      logger.info(`AI stream finished: ${text.length} chars`);
      onFinish?.(text);
    },
  });

  return result.textStream;
}
