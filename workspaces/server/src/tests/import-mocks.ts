import { vi } from "vitest";

// Worker で import できないが、どうせ使わないので mock
// ref: https://developers.cloudflare.com/workers/testing/vitest-integration/known-issues/#importing-modules-from-global-setup-file
vi.importMock("discord-api-types/v10");
vi.importMock("ics");
vi.importMock("wasm-image-optimization");
