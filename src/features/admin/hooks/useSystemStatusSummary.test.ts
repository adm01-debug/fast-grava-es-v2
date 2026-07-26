import { describe, expect, it } from "vitest";
import { deriveOverallStatus } from "./useSystemStatusSummary";

const base = {
  total_jobs: 5,
  healthy_jobs: 5,
  failing_jobs: 0,
  stale_jobs: 0,
  last_capture: new Date().toISOString(),
};

describe("deriveOverallStatus", () => {
  it("retorna 'unknown' sem dados", () => {
    expect(deriveOverallStatus(null)).toBe("unknown");
  });

  it("retorna 'unknown' quando não há rotinas monitoradas", () => {
    expect(deriveOverallStatus({ ...base, total_jobs: 0, healthy_jobs: 0 })).toBe("unknown");
  });

  it("retorna 'operational' quando tudo está saudável", () => {
    expect(deriveOverallStatus(base)).toBe("operational");
  });

  it("retorna 'degraded' com rotina silenciosa", () => {
    expect(deriveOverallStatus({ ...base, healthy_jobs: 4, stale_jobs: 1 })).toBe("degraded");
  });

  it("prioriza 'outage' sobre 'degraded'", () => {
    expect(deriveOverallStatus({ ...base, healthy_jobs: 3, stale_jobs: 1, failing_jobs: 1 })).toBe(
      "outage",
    );
  });
});
