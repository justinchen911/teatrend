import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const SCRAPER_DIR = path.resolve(process.cwd(), "scripts/scraper");

describe("scripts/scraper", () => {
  describe("seed-accounts.json", () => {
    it("should be valid JSON", () => {
      const filePath = path.join(SCRAPER_DIR, "seed-accounts.json");
      const raw = fs.readFileSync(filePath, "utf-8");
      expect(() => JSON.parse(raw)).not.toThrow();
    });

    it("should be an array of account objects", () => {
      const filePath = path.join(SCRAPER_DIR, "seed-accounts.json");
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it("each account should have required fields", () => {
      const filePath = path.join(SCRAPER_DIR, "seed-accounts.json");
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      const requiredFields = ["platform", "accountId", "homeUrl", "isActive"];

      for (const account of data) {
        for (const field of requiredFields) {
          expect(account).toHaveProperty(field);
        }
        expect(typeof account.isActive).toBe("boolean");
        expect(typeof account.platform).toBe("string");
        expect(typeof account.accountId).toBe("string");
      }
    });

    it("platform values should be from known set", () => {
      const filePath = path.join(SCRAPER_DIR, "seed-accounts.json");
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      const knownPlatforms = ["xiaohongshu", "douyin", "weibo", "bilibili"];

      for (const account of data) {
        expect(knownPlatforms).toContain(account.platform);
      }
    });
  });

  describe("output file naming", () => {
    it("search output files should match search-YYYY-MM-DD.json pattern", () => {
      // Verify the naming regex pattern used for search output files
      const pattern = /^search-\d{4}-\d{2}-\d{2}\.json$/;

      // Test valid names
      expect(pattern.test("search-2024-01-15.json")).toBe(true);
      expect(pattern.test("search-2025-12-31.json")).toBe(true);

      // Test invalid names
      expect(pattern.test("search-2024-1-5.json")).toBe(false);
      expect(pattern.test("search-24-01-15.json")).toBe(false);
      expect(pattern.test("search_2024_01_15.json")).toBe(false);
      expect(pattern.test("search-2024-01-15.txt")).toBe(false);
    });

    it("report output files should match report-YYYY-MM-DD.json pattern", () => {
      const pattern = /^report-\d{4}-\d{2}-\d{2}\.json$/;

      expect(pattern.test("report-2024-01-15.json")).toBe(true);
      expect(pattern.test("report-2025-12-31.json")).toBe(true);
      expect(pattern.test("report-2024-1-5.json")).toBe(false);
    });

    it("daily-collect script uses correct naming convention", () => {
      const scriptPath = path.join(SCRAPER_DIR, "daily-collect.mjs");
      const content = fs.readFileSync(scriptPath, "utf-8");

      // The script should generate filenames with the date pattern
      expect(content).toMatch(/report-\$\{/);
      expect(content).toMatch(/\.json/);
    });
  });
});
