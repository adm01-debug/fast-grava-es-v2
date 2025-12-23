// Workaround for TS2305: "@testing-library/react" has no exported member 'screen'.
// We augment the module typings to include `screen`.
// This does not change runtime behavior; it only fixes TypeScript's view of the exports.

declare module "@testing-library/react" {
  export const screen: typeof import("@testing-library/dom").screen;
}
