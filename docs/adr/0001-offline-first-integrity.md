# ADR 0001: Offline-First Architecture & Data Integrity

## Status
Accepted

## Date
2026-05-13

## Context
The application operates in industrial environments where network stability is not guaranteed. Data loss during production tracking (like starting/finishing jobs) has high operational cost.

## Decision
We implement an **Offline-First** strategy using a layered approach:
1.  **Persistence**: Using `indexedDB` (via TanStack Query persistence or custom wrappers) to store critical local state.
2.  **Sync Engine**: Edge Functions and client-side hooks monitor connection status (`useNetworkStatus`) and retry failed mutations.
3.  **Conflict Resolution**: Last-write-wins with server-side audit logs to track manual corrections.
4.  **Optimistic UI**: Immediate UI feedback for actions while sync is pending.

## Consequences
*   Increased client-side complexity.
*   Reliable operation in low-connectivity zones.
*   Requirement for robust `updated_at` tracking and versioning in critical tables.
