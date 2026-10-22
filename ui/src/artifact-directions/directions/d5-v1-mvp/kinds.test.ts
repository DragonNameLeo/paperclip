import { Music } from "lucide-react";
import { describe, expect, it } from "vitest";
import { glyphOf, isPortrait, labelOf, mediaKindOf, treatmentOf } from "./kinds";
import { testArtifact } from "./test-artifact";

describe("treatmentOf", () => {
  it("prints media that has a preview and falls back when it has none", () => {
    expect(treatmentOf(testArtifact({ kind: "image", thumbnailUrl: "/cap.svg" }))).toBe("media");
    expect(treatmentOf(testArtifact({ kind: "video" }))).toBe("media-fallback");
    expect(treatmentOf(testArtifact({ kind: "file", ext: "mp3" }))).toBe("media-fallback");
  });

  it("previews a document whose text is known and shows the sheet otherwise", () => {
    expect(treatmentOf(testArtifact({ kind: "document", body: "# Plan" }))).toBe("preview");
    expect(treatmentOf(testArtifact({ kind: "document", excerpt: "Plan" }))).toBe("preview");
    expect(treatmentOf(testArtifact({ kind: "document" }))).toBe("icon");
    expect(treatmentOf(testArtifact({ kind: "pdf" }))).toBe("icon");
  });
});

describe("labelOf", () => {
  it("takes the type from the extension and keeps links as URL", () => {
    expect(labelOf(testArtifact({ kind: "slides", filename: "deck.pptx" }))).toBe("PPTX");
    expect(labelOf(testArtifact({ kind: "file", ext: "otf", filename: "Font.otf" }))).toBe("OTF");
    expect(labelOf(testArtifact({ kind: "link", url: "https://example.com" }))).toBe("URL");
    expect(labelOf(testArtifact({ kind: "document" }))).toBe("MD");
  });
});

describe("isPortrait", () => {
  it("stands only prints that are taller than wide; a square lies", () => {
    expect(isPortrait(testArtifact({ kind: "image", aspect: 4 / 5 }))).toBe(true);
    expect(isPortrait(testArtifact({ kind: "image", aspect: 1 }))).toBe(false);
    expect(isPortrait(testArtifact({ kind: "image" }))).toBe(false);
  });
});

describe("glyphOf and mediaKindOf", () => {
  it("draws PDF as bars, audio with the music glyph, and sorts kinds into the filter tabs", () => {
    expect(glyphOf(testArtifact({ kind: "pdf" }))).toBe("bars");
    expect(glyphOf(testArtifact({ kind: "file", ext: "wav" }))).toBe(Music);
    expect(mediaKindOf(testArtifact({ kind: "code" }))).toBe("text");
    expect(mediaKindOf(testArtifact({ kind: "archive" }))).toBe("file");
    expect(mediaKindOf(testArtifact({ kind: "video" }))).toBe("video");
  });
});
