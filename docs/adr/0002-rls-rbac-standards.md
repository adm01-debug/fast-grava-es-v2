# ADR 0002: Restrictive Access Control (RLS & RBAC)

## Status
Accepted

## Date
2026-05-13

## Context
The system handles sensitive production data and personnel information. Privilege escalation must be prevented at the database level.

## Decision
1.  **Row Level Security (RLS)**: Mandatory for all tables. No table should exist without at least one policy.
2.  **Role Based Access Control (RBAC)**: Centralized in `user_roles` table.
3.  **Permissions Logic**: Encapsulated in `has_role` PostgreSQL functions (security definer) to avoid logic leakage to client-side.
4.  **Audit**: All sensitive mutations (DELETE, certain UPDATEs) must leave traces in `audit_logs`.

## Consequences
*   Strong security posture.
*   More complex migrations requiring RLS definitions.
*   Simplified frontend code using `useRBAC` hook for UI-only hiding of elements.
