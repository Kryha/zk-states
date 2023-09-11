import matchers from "@testing-library/jest-dom/matchers";
import { expect, vi } from "vitest";
import createFetchMock from "vitest-fetch-mock";
import "vitest-canvas-mock";

expect.extend(matchers);

const fetchMocker = createFetchMock(vi);

// sets globalThis.fetch and globalThis.fetchMock to our mocked version
fetchMocker.enableMocks();
