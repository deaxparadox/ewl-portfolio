import { describe, expect, it } from "vitest";
import path from "node:path";
import ts from "typescript";

// Type-check a deliberately wrong content file and return its error diagnostics.
function diagnose(file: string) {
  const program = ts.createProgram([file], {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    jsx: ts.JsxEmit.Preserve,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022,
    types: [],
  });
  return ts.getPreEmitDiagnostics(program).filter((d) => d.category === ts.DiagnosticCategory.Error);
}

const FIXTURE = path.join(__dirname, "../fixtures/bad-content.fixture.ts");

describe("content types: negative", () => {
  const errors = diagnose(FIXTURE).map((d) => ({
    code: d.code,
    text: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
  }));

  it("rejects a card that is missing a required field (TS2741, names 'body')", () => {
    const e = errors.find((x) => x.code === 2741);
    expect(e, JSON.stringify(errors)).toBeDefined();
    expect(e!.text).toContain("'body'");
  });

  it("rejects a tags field of the wrong type (TS2322)", () => {
    const e = errors.find((x) => x.code === 2322 && x.text.includes("string[]"));
    expect(e, JSON.stringify(errors)).toBeDefined();
  });
});
