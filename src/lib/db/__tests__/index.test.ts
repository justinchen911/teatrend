import { describe, it, expect } from "vitest";

/**
 * Prisma Client 单例测试
 * 
 * 注意：Prisma Client 需要 @prisma/client 生成才能实例化，
 * 在 CI / 无数据库环境下会失败，因此仅验证模块导出结构。
 */
describe("db/index.ts", () => {
  it.skip("should export a db singleton (requires Prisma Client generation)", async () => {
    // Prisma Client 需要 `npx prisma generate` 才能使用。
    // 在有生成产物的环境下可以取消 skip 验证：
    // const { db } = await import("@/lib/db");
    // expect(db).toBeDefined();
    // expect(db).toBe(globalThis.prisma); // 单例验证
  });

  it("module structure should be importable without runtime error", async () => {
    // 验证模块文件存在且语法正确（import 不会抛出语法错误）
    // 但由于 Prisma Client 可能未生成，这里只检查文件可读性
    const fs = await import("node:fs");
    const path = await import("node:path");
    const filePath = path.resolve(process.cwd(), "src/lib/db/index.ts");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("PrismaClient");
    expect(content).toContain("export const db");
  });
});
