// POST /api/save : écrit les réponses dans answers.json sur GitHub
const REPO = process.env.GH_REPO;                 // ex. "ton-user/ton-repo"
const BRANCH = process.env.GH_BRANCH || "main";
const FILE = "answers.json";

const headers = () => ({
  Authorization: "Bearer " + process.env.GH_TOKEN,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "douze-semaines"
});

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const answers = req.body;
  if (!answers || typeof answers !== "object" || JSON.stringify(answers).length > 50000) {
    return res.status(400).json({ error: "payload invalide" });
  }
  const url = "https://api.github.com/repos/" + REPO + "/contents/" + FILE;
  let sha;
  const cur = await fetch(url + "?ref=" + BRANCH, { headers: headers() });
  if (cur.ok) sha = (await cur.json()).sha;
  const put = await fetch(url, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      message: "[skip ci] réponses sauvegardées",
      content: Buffer.from(JSON.stringify(answers, null, 2)).toString("base64"),
      branch: BRANCH,
      sha
    })
  });
  if (!put.ok) return res.status(502).json({ error: "github" });
  res.status(200).json({ ok: true });
};
