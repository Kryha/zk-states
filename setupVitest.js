//setupVitest.js or similar file
import { vi } from "vitest";
import createFetchMock from "vitest-fetch-mock";
import "vitest-canvas-mock";

const fetchMocker = createFetchMock(vi);

// sets globalThis.fetch and globalThis.fetchMock to our mocked version
fetchMocker.enableMocks();
