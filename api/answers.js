// GET /api/answers : renvoie answers.json tel qu’il est sur GitHub (toujours à jour)
module.exports = async (req, res) => {
  const url = "https://api.github.com/repos/" + process.env.GH_REPO + "/contents/answers.json?ref=" + (process.env.GH_BRANCH || "main");
  const r = await fetch(url, {
    headers: {
      Authorization: "Bearer " + process.env.GH_TOKEN,
      Accept: "application/vnd.github.raw+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "douze-semaines"
    }
  });
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(r.ok ? await r.text() : "{}");
};
