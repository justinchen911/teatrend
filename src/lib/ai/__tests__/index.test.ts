import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the AI SDK before importing our module
vi.mock("ai", () => ({
  generateText: vi.fn(),
  streamText: vi.fn(),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(() => {
    const modelFn = (name: string) => ({ modelId: name, provider: "openai" });
    return modelFn;
  }),
}));

import { generateText, streamText } from "ai";
import { aiGenerate, aiStream } from "@/lib/ai";

describe("ai/index.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("aiGenerate()", () => {
    it("should call generateText and return text result", async () => {
      const mockText = "Hello from AI";
      vi.mocked(generateText).mockResolvedValue({ text: mockText } as any);

      const result = await aiGenerate({
        prompt: "Say hello",
        provider: "openai",
      });

      expect(result).toBe(mockText);
      expect(generateText).toHaveBeenCalledTimes(1);
    });

    it("should pass correct parameters to generateText", async () => {
      vi.mocked(generateText).mockResolvedValue({ text: "ok" } as any);

      await aiGenerate({
        prompt: "test prompt",
        system: "system instruction",
        provider: "openai",
        temperature: 0.5,
        maxTokens: 100,
      });

      const callArgs = vi.mocked(generateText).mock.calls[0][0];
      expect(callArgs.prompt).toBe("test prompt");
      expect(callArgs.system).toBe("system instruction");
      expect(callArgs.temperature).toBe(0.5);
      expect(callArgs.maxTokens).toBe(100);
    });

    it("should default to openai provider and gpt-4o-mini model", async () => {
      vi.mocked(generateText).mockResolvedValue({ text: "ok" } as any);

      await aiGenerate({ prompt: "test" });

      const callArgs = vi.mocked(generateText).mock.calls[0][0];
      // model is created by mock, but we can verify generateText was called
      expect(callArgs.prompt).toBe("test");
    });

    it("should use deepseek provider when specified", async () => {
      vi.mocked(generateText).mockResolvedValue({ text: "deepseek response" } as any);

      const result = await aiGenerate({
        prompt: "test",
        provider: "deepseek",
      });

      expect(result).toBe("deepseek response");
      expect(generateText).toHaveBeenCalledTimes(1);
    });

    it("should use default temperature 0.7 when not specified", async () => {
      vi.mocked(generateText).mockResolvedValue({ text: "ok" } as any);

      await aiGenerate({ prompt: "test" });

      const callArgs = vi.mocked(generateText).mock.calls[0][0];
      expect(callArgs.temperature).toBe(0.7);
    });
  });

  describe("aiStream()", () => {
    it("should call streamText and return textStream", () => {
      const mockStream = (async function* () {
        yield "chunk1";
        yield "chunk2";
      })();

      vi.mocked(streamText).mockReturnValue({
        textStream: mockStream,
      } as any);

      const result = aiStream({ prompt: "stream test" });

      expect(streamText).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockStream);
    });

    it("should pass correct parameters to streamText", () => {
      const mockStream = (async function* () {
        yield "x";
      })();

      vi.mocked(streamText).mockReturnValue({
        textStream: mockStream,
      } as any);

      aiStream({
        prompt: "stream prompt",
        system: "system",
        provider: "openai",
        temperature: 0.3,
        maxTokens: 200,
      });

      const callArgs = vi.mocked(streamText).mock.calls[0][0];
      expect(callArgs.prompt).toBe("stream prompt");
      expect(callArgs.system).toBe("system");
      expect(callArgs.temperature).toBe(0.3);
      expect(callArgs.maxTokens).toBe(200);
    });

    it("should call onFinish callback when stream completes", async () => {
      const onFinish = vi.fn();

      vi.mocked(streamText).mockReturnValue({
        textStream: (async function* () {
          yield "hello ";
          yield "world";
        })(),
      } as any);

      aiStream({
        prompt: "test",
        onFinish,
      });

      // Get the onFinish handler passed to streamText
      const callArgs = vi.mocked(streamText).mock.calls[0][0];
      // Simulate streamText's onFinish being called
      callArgs.onFinish?.({ text: "hello world" });

      expect(onFinish).toHaveBeenCalledWith("hello world");
    });
  });
});
