export const TX_FEE = 0.1;
export const TX_MEMO = "State verification";

export const wait = (ms = 2000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const cloneState = <T extends object>(store: T) => {
  const clonedStore = Object.assign({}, store);

  const filteredStore: Record<string, unknown> = Object.entries(
    clonedStore,
  ).reduce((acc, [key, value]) => {
    if (typeof value === "function") return acc;
    return { ...acc, [key]: value };
  }, {});

  return filteredStore;
};

// TODO: update rollup config to replace `import.meta.ENV` with `process.env.NODE_ENV`
const isDevEnv = () => {
  return process.env.NODE_ENV === "development";
};

export const logger = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message?: string, ...args: any[]) {
    if (isDevEnv()) console.warn(message, args);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(message?: string, ...args: any[]) {
    if (isDevEnv()) console.info(message, args);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message?: string, ...args: any[]) {
    if (isDevEnv()) console.error(message, args);
  },
};
