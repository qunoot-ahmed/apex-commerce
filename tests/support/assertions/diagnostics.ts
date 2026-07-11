import { expect } from "../fixtures/test";

export async function expectNoCriticalBrowserErrors(
  consoleMessages: string[],
  failedResponses: string[]
) {
  expect.soft(consoleMessages, "No critical browser console errors").toEqual([]);
  expect.soft(failedResponses, "No failed critical network responses").toEqual([]);
}
