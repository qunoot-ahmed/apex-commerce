const target = process.env.WAIT_ON_URL ?? process.argv[2] ?? "http://127.0.0.1:3000";
const timeoutMs = Number(process.env.WAIT_ON_TIMEOUT_MS ?? 120_000);
const intervalMs = Number(process.env.WAIT_ON_INTERVAL_MS ?? 1_000);
const started = Date.now();

async function poll() {
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(target, { redirect: "manual" });
      if (response.status < 500) {
        console.log(`Ready: ${target} returned ${response.status}`);
        return;
      }
      console.log(`Waiting: ${target} returned ${response.status}`);
    } catch (error) {
      console.log(`Waiting: ${target} is not ready (${error.message})`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Timed out after ${timeoutMs}ms waiting for ${target}`);
}

poll().catch((error) => {
  console.error(error);
  process.exit(1);
});
