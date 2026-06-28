// Centralized Recharts entrypoint.
//
// Production builds previously split Recharts' ESM graph across route/vendor
// chunks, which exposed a TDZ/circular-initialization bug in minified output
// (`Cannot access 'A' before initialization`). Re-exporting from the package's
// CommonJS build gives Rollup one stable module boundary for every chart import
// and avoids the broken inter-chunk initialization order.
export * from 'recharts/lib';
