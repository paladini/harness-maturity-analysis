// Gate hook: denies reading files that look like they hold credentials,
// keeping them out of model context entirely.
// Contract: JSON on stdin ({ file_path } or { filePath }), JSON on stdout ({ permission }).
let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let filePath = '';
  try {
    const payload = JSON.parse(input || '{}');
    filePath = String(payload.file_path ?? payload.filePath ?? '');
  } catch {
    // Unparseable payload: allow — this gate only targets known-secret-shaped paths.
  }
  const normalized = filePath.replace(/\\/g, '/');
  const secretShaped =
    /(^|\/)\.env(\.(?!example$)[^/]+)?$/.test(normalized) ||
    /(^|\/)\.env$/.test(normalized) ||
    /\.(pem|key|p12|pfx)$/i.test(normalized);
  if (secretShaped) {
    process.stdout.write(
      JSON.stringify({
        permission: 'deny',
        userMessage: `Blocked by .cursor/hooks/guard-secrets-read.js: "${filePath}" looks credential-shaped. Read .env.example instead, or open it yourself if you genuinely need to.`,
      }),
    );
  } else {
    process.stdout.write(JSON.stringify({ permission: 'allow' }));
  }
});
