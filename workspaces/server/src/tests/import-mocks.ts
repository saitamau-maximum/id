import { vi } from "vitest";

// Worker で import できないが、どうせ使わないので mock
// ref: https://developers.cloudflare.com/workers/testing/vitest-integration/known-issues/#importing-modules-from-global-setup-file
vi.mock("discord-api-types/v10", () => ({ default: vi.fn() }));
vi.mock("ics", () => ({ default: vi.fn() }));
vi.mock("wasm-image-optimization", () => ({ default: vi.fn() }));
