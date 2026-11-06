#!/usr/bin/env node
import https from "node:https";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID || "prj_6UIfStMQ5VllGfCB05CAJChmA7at";
const TEAM_ID = process.env.VERCEL_TEAM_ID || "team_ys2LrykyP6IqMl3wsiDE5VBm";
const RETAIN_COUNT = parseInt(process.env.RETAIN_PROD_COUNT || "3", 10);
const IS_CONFIRM = process.argv.includes("--confirm");

if (!VERCEL_TOKEN) {
  console.error("\n❌ Error: VERCEL_TOKEN environment variable is required.");
  console.error("Usage: VERCEL_TOKEN=<token> node scripts/prune-vercel-deployments.mjs [--confirm]\n");
  console.error("To get a token, visit: https://vercel.com/account/tokens\n");
  process.exit(1);
}

function vercelRequest(endpoint, method = "GET") {
  return new Promise((resolve, reject) => {
    // Append teamId if not already present
    const separator = endpoint.includes("?") ? "&" : "?";
    const fullEndpoint = TEAM_ID && !endpoint.includes("teamId=")
      ? `${endpoint}${separator}teamId=${TEAM_ID}`
      : endpoint;

    const req = https.request(
      `https://api.vercel.com${fullEndpoint}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "studioNeo-retention-script/1.0",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            if (res.statusCode >= 400) {
              reject(new Error(`API Error (${res.statusCode}): ${parsed.error?.message || data}`));
            } else {
              resolve(parsed);
            }
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function main() {
  console.log(`\n======================================================`);
  console.log(`  Vercel Deployment Retention & Storage Pruning Tool  `);
  console.log(`======================================================`);
  console.log(`Target Project: ${PROJECT_ID}`);
  console.log(`Retaining: Top ${RETAIN_COUNT} most recent production deployments`);
  console.log(`Mode: ${IS_CONFIRM ? "🚀 EXECUTE (DELETIONS ENABLED)" : "🔍 DRY RUN (READ ONLY)"}\n`);

  console.log(`Fetching deployment list from Vercel API...`);
  const response = await vercelRequest(`/v6/deployments?projectId=${PROJECT_ID}&limit=100`);
  const deployments = response.deployments || [];

  if (deployments.length === 0) {
    console.log("No deployments found for this project.");
    return;
  }

  // Filter and sort deployments
  const prodDeployments = deployments
    .filter((d) => d.target === "production")
    .sort((a, b) => b.created - a.created);

  const previewDeployments = deployments
    .filter((d) => d.target !== "production")
    .sort((a, b) => b.created - a.created);

  const toRetain = prodDeployments.slice(0, RETAIN_COUNT);
  const toDeleteProd = prodDeployments.slice(RETAIN_COUNT);
  const toDelete = [...toDeleteProd, ...previewDeployments];

  console.log(`\n🛡️  PROTECTED PRODUCTION DEPLOYMENTS (${toRetain.length} retained):`);
  console.log(`----------------------------------------------------------------------------------------------------`);
  toRetain.forEach((d, i) => {
    const isLive = i === 0 ? " [ACTIVE LIVE]" : " [ROLLBACK TARGET]";
    console.log(
      `  #${i + 1}${isLive} ID: ${d.uid} | ${new Date(d.created).toISOString()} | ${d.url} | Commit: ${d.meta?.githubCommitSha?.slice(0, 7) || "N/A"}`
    );
  });
  console.log(`----------------------------------------------------------------------------------------------------\n`);

  console.log(`🗑️  DEPLOYMENTS SCHEDULED FOR PURGE (${toDelete.length} total):`);
  console.log(`  - ${toDeleteProd.length} older production deployments`);
  console.log(`  - ${previewDeployments.length} preview deployments`);
  console.log(`----------------------------------------------------------------------------------------------------`);
  toDelete.forEach((d, i) => {
    console.log(
      `  #${i + 1} [${d.target || "preview"}] ID: ${d.uid} | State: ${d.state} | ${new Date(d.created).toISOString()} | ${d.url}`
    );
  });
  console.log(`----------------------------------------------------------------------------------------------------\n`);

  if (!IS_CONFIRM) {
    console.log(`⚠️  DRY RUN COMPLETED. No deployments were deleted.`);
    console.log(`To permanently purge these ${toDelete.length} deployments, run with the --confirm flag:`);
    console.log(`   VERCEL_TOKEN=... npm run vercel:prune\n`);
    return;
  }

  console.log(`🚀 Starting purge of ${toDelete.length} deployments...`);
  let successCount = 0;
  let failCount = 0;

  for (const dep of toDelete) {
    // Extra safety guard: never delete any deployment in the toRetain list
    if (toRetain.some((r) => r.uid === dep.uid)) {
      console.warn(`  ⚠️ Skipping protected deployment: ${dep.uid}`);
      continue;
    }

    try {
      await vercelRequest(`/v13/deployments/${dep.uid}`, "DELETE");
      console.log(`  ✅ Successfully deleted: ${dep.uid} (${dep.url})`);
      successCount++;
      // Pacing delay (250ms) to respect Vercel rate limits
      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch (err) {
      console.error(`  ❌ Failed to delete ${dep.uid}: ${err.message}`);
      failCount++;
    }
  }

  console.log(`\n======================================================`);
  console.log(`Purge Complete!`);
  console.log(`  - Successfully deleted: ${successCount}`);
  console.log(`  - Failed: ${failCount}`);
  console.log(`  - Preserved: ${toRetain.length} production deployments`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error("\n❌ Fatal error during execution:", err.message);
  process.exit(1);
});
