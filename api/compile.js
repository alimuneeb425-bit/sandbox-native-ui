// api/compile.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { developerSourceCode } = req.body;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Vercel pulls this from your Settings
  const REPO_OWNER = "alimuneeb425-bit";
  const REPO_NAME = "apk-compiler-node";

  try {
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: 'trigger_native_compile',
        client_payload: { project_files: developerSourceCode }
      })
    });

    if (response.status === 204) {
      return res.status(200).json({ status: 'processing' });
    } else {
      throw new Error('Failed to trigger GitHub compilation');
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
