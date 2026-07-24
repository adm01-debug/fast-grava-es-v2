/**
 * E2E test credentials — read from the environment so real secrets never
 * live in source control. The fallbacks keep local runs working against a
 * dev instance seeded with the standard test user; CI provides E2E_EMAIL /
 * E2E_PASSWORD via repository secrets (see .github/workflows/ci.yml).
 */
export const E2E_EMAIL = process.env.E2E_EMAIL ?? 'admin@fastgravacoes.com.br';
export const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'Fast@2026!';
