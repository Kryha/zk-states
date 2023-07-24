const jestConfig: import("ts-jest").JestConfigWithTsJest = {
  verbose: true,
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  testTimeout: 1_000_000,
  transform: {
    "^.+\\.(t)s$": "ts-jest",
    "^.+\\.(j)s$": "babel-jest",
  },
  testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.test.tsx"],
  resolver: "<rootDir>/jest-resolver.cjs",
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!(tslib|snarkyjs/node_modules/tslib))",
  ],
  modulePathIgnorePatterns: ["<rootDir>/build/"],
  moduleNameMapper: {
    "^(\\.{1,2}/.+)\\.js$": "$1",
    "zk-state": "<rootDir>/src/index.ts",
  },
};

export default jestConfig;
