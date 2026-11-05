// BR-01m6ph6dq7aszxhxgzz4kgr8d4 (The conversation keeps what happened in it): the assistant's replies are shown with their
// formatting. The model writes a little Markdown (bold, lists); this reads it into blocks the screen can draw, and nothing more.

export type Span = { text: string; bold: boolean };
export type Block = { kind: "p"; spans: Span[] } | { kind: "li"; mark: string; spans: Span[] };

/** **bold** inside a line; an unmatched ** is kept as text. */
export function spansOf(line: string): Span[] {
  const out: Span[] = [];
  const parts = line.split("**");
  if (parts.length % 2 === 0) return [{ text: line, bold: false }];
  parts.forEach((text, i) => { if (text) out.push({ text, bold: i % 2 === 1 }); });
  return out;
}

/** Paragraphs and list items; a blank line separates paragraphs, "- ", "* ", "• " and "1. " start list items. */
export function blocksOf(text: string): Block[] {
  const out: Block[] = [];
  let para: string[] = [];
  const flush = () => { if (para.length) { out.push({ kind: "p", spans: spansOf(para.join(" ")) }); para = []; } };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    const num = /^(\d+)[.)]\s+(.*)$/.exec(line);
    if (!line) flush();
    else if (bullet) { flush(); out.push({ kind: "li", mark: "•", spans: spansOf(bullet[1]!) }); }
    else if (num) { flush(); out.push({ kind: "li", mark: `${num[1]}.`, spans: spansOf(num[2]!) }); }
    else para.push(line);
  }
  flush();
  return out;
}
