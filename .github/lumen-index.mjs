// Builds lumen.json: the HTTP codes and protocols from README.md (and the
// first line of prot/*.md files the README doesn't list), in one file that
// Lumen downloads for its "h:" search. Run: node .github/lumen-index.mjs
// The GitHub Action in .github/workflows/lumen-index.yml runs it on every push.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");

/** Markdown and HTML out, spaces squeezed. */
const plain = (s) =>
  s
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*|__|`/g, "")
    .replace(/\s+/g, " ")
    .trim();

const cells = (line) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

const http = [];
const protocols = [];
let block = ""; // "HTTP", "SSH"...: a "Name:" line before a table of codes
let group = "";

for (const line of readme.split(/\r?\n/)) {
  const label = /^([A-Za-z][\w /+-]*):\s*$/.exec(line.trim());
  if (label) {
    block = label[1].toUpperCase();
    continue;
  }
  const heading = /^#{2,4}\s+(.+)$/.exec(line);
  if (heading) {
    group = plain(heading[1]);
    continue;
  }
  if (!line.trim().startsWith("|")) continue;
  const row = cells(line);

  const link = /^\[([^\]]+)\]\((prot\/[^)]+\.md)\)$/.exec(row[0]);
  if (link) {
    protocols.push({
      id: path.basename(link[2], ".md").toLowerCase(),
      name: plain(link[1]),
      fullName: plain(row[1] ?? ""),
      description: plain(row[2] ?? ""),
      group,
      file: link[2],
    });
    continue;
  }

  const code = /^\d{3}$/.test(row[0]) ? Number(row[0]) : null;
  if (block === "HTTP" && code && row[1]) {
    if (!http.some((c) => c.code === code)) {
      http.push({ code, phrase: plain(row[1]), description: plain(row[2] ?? ""), category: `${String(code)[0]}xx` });
    }
  }
}

// Files the README doesn't list yet: name, full name and description from
// their first line, "**Name** (Full Name) — what it is."
const listed = new Set(protocols.map((p) => p.file));
for (const file of fs.readdirSync(path.join(root, "prot")).sort()) {
  const rel = `prot/${file}`;
  if (!file.endsWith(".md") || listed.has(rel)) continue;
  const first = fs.readFileSync(path.join(root, rel), "utf8").split(/\r?\n/).find((l) => l.trim()) ?? "";
  const [head, ...rest] = first.split(/\s+—\s+/);
  const names = [...head.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1].trim());
  const fulls = [...head.matchAll(/\(([^)]+)\)/g)].map((m) => m[1].trim());
  const sentence = plain(rest.join(" — ")).split(/(?<=[.!?])\s/)[0] ?? "";
  protocols.push({
    id: path.basename(file, ".md").toLowerCase(),
    name: names.join(" / ") || path.basename(file, ".md"),
    fullName: fulls.join(" / "),
    description: sentence,
    group: "",
    file: rel,
  });
}

// Every name a protocol is searched by: "TLS / SSL" → tls, ssl; "Wi-Fi" → wi-fi, wifi.
for (const p of protocols) {
  const names = [p.id, p.name, ...p.name.split(/\s*\/\s*|\s+и\s+|,\s*/)].map((n) => n.trim().toLowerCase()).filter(Boolean);
  p.aliases = [...new Set(names.flatMap((n) => [n, n.replace(/[^\p{L}\p{N}+]/gu, "")]).filter(Boolean))];
}

http.sort((a, b) => a.code - b.code);
const index = { version: 1, http, protocols };
fs.writeFileSync(path.join(root, "lumen.json"), JSON.stringify(index, null, 2) + "\n");
console.log(`lumen.json: ${http.length} HTTP codes, ${protocols.length} protocols`);
