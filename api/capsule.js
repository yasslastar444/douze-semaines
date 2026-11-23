// GET /api/capsule : renvoie la capsule chiffrée (capsule.json sur GitHub)
// POST /api/capsule : enregistre la capsule chiffrée dans capsule.json
const REPO = process.env.GH_REPO;
const BRANCH = process.env.GH_BRANCH || "main";
const FILE = "capsule.json";
const url = () => "https://api.github.com/repos/" + REPO + "/contents/" + FILE;
const headers = (accept) => ({
  Authorization: "Bearer " + process.env.GH_TOKEN,
  Accept: accept || "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "douze-semaines"
});

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") {
    const r = await fetch(url() + "?ref=" + BRANCH, { headers: headers("application/vnd.github.raw+json") });
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(r.ok ? await r.text() : "{}");
  }
  if (req.method !== "POST") return res.status(405).end();
  const b = req.body;
  const ok = b && typeof b.salt === "string" && typeof b.iv === "string" && typeof b.data === "string";
  if (!ok || b.data.length > 3000000) return res.status(400).json({ error: "payload invalide" });
  let sha;
  const cur = await fetch(url() + "?ref=" + BRANCH, { headers: headers() });
  if (cur.ok) sha = (await cur.json()).sha;
  const put = await fetch(url(), {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      message: "[skip ci] capsule scellée",
      content: Buffer.from(JSON.stringify({ salt: b.salt, iv: b.iv, data: b.data })).toString("base64"),
      branch: BRANCH,
      sha
    })
  });
  if (!put.ok) return res.status(502).json({ error: "github" });
  res.status(200).json({ ok: true });
};
