import { Archive, CodeXml, File, FileText, Film, Globe, Image, Music, Presentation, Table2, type LucideIcon } from "lucide-react";
import type { LabArtifact, LabKind } from "../../kit";

/**
 * Which of the mock's four treatments an artifact gets.
 *
 *  preview         a text file whose title is known: the white sheet with the
 *                  title set on it
 *  icon            any other file or document: the grey sheet, a glyph top-left
 *                  and the type in caps
 *  media           an image or video with a preview: the print with a white border
 *  media-fallback  media with nothing to show (audio, a video without a poster):
 *                  the grey sheet with the media glyph and a play button
 */
export type Treatment = "preview" | "icon" | "media" | "media-fallback";

const AUDIO = /^(mp3|wav|m4a|aac|flac|ogg|aiff?)$/i;

export const isAudio = (artifact: LabArtifact) => artifact.kind === "file" && AUDIO.test(artifact.ext ?? "");

export const isMedia = (artifact: LabArtifact) => artifact.kind === "image" || artifact.kind === "video" || isAudio(artifact);

export function treatmentOf(artifact: LabArtifact): Treatment {
  if (artifact.kind === "image" || artifact.kind === "video") return artifact.thumbnailUrl ? "media" : "media-fallback";
  if (isAudio(artifact)) return "media-fallback";
  if (artifact.kind === "document" && (artifact.body || artifact.excerpt)) return "preview";
  return "icon";
}

/** Portrait prints stand; everything else lies. A square counts as landscape. */
export const isPortrait = (artifact: LabArtifact) => (artifact.aspect ?? 1) < 1;

const FALLBACK_LABEL: Record<LabKind, string> = {
  document: "MD",
  pdf: "PDF",
  slides: "PPTX",
  sheet: "CSV",
  archive: "ZIP",
  code: "CODE",
  file: "FILE",
  link: "URL",
  image: "IMG",
  video: "VIDEO",
};

/** The type in caps, from the real extension when there is one. */
export function labelOf(artifact: LabArtifact): string {
  const ext = artifact.ext ?? artifact.filename?.match(/\.([a-z0-9]+)$/i)?.[1];
  if (artifact.kind === "link") return "URL";
  return (ext ?? FALLBACK_LABEL[artifact.kind]).toUpperCase();
}

/**
 * The glyph top-left. The mock draws PDF with three bars; every other type
 * takes its lucide icon in the same ink.
 */
export type Glyph = "bars" | LucideIcon;

const ICON: Record<LabKind, Glyph> = {
  pdf: "bars",
  document: FileText,
  slides: Presentation,
  sheet: Table2,
  archive: Archive,
  code: CodeXml,
  file: File,
  link: Globe,
  image: Image,
  video: Film,
};

export function glyphOf(artifact: LabArtifact): Glyph {
  if (isAudio(artifact)) return Music;
  return ICON[artifact.kind];
}

/** The product's media kinds, which its filter tabs are named after. */
export type MediaKind = "image" | "video" | "document" | "text" | "file";

export function mediaKindOf(artifact: LabArtifact): MediaKind {
  switch (artifact.kind) {
    case "image":
      return "image";
    case "video":
      return "video";
    case "document":
      return "document";
    case "code":
    case "sheet":
      return "text";
    default:
      return "file";
  }
}
