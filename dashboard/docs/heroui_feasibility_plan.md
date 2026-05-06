# HeroUI Feasibility Plan (Repository-Evidence Only)

## HeroUI quick-start findings
- External HeroUI quick-start documentation was **not used for this planning pass**.
- Feasibility status is therefore: **insufficient external verification; pending manual HeroUI documentation access**.
- This document intentionally avoids asserting package/version requirements that cannot be verified from local project evidence.

## Current project stack (from package.json)
- React: `^18.3.1`
- React DOM: `^18.3.1`
- Router: `react-router-dom ^6.26.0`
- Build system: Vite `^5.4.0` with `@vitejs/plugin-react ^4.3.1`
- Styling: Tailwind CSS `^3.4.7`, PostCSS `^8.4.40`, Autoprefixer `^10.4.19`
- Charts: Recharts `^2.12.7`
- State/data: `@tanstack/react-query ^5.51.23`
- TypeScript: `^5.5.4`

## Compatibility assessment
- The dashboard currently operates on a stable React 18 + Vite 5 + Tailwind 3 stack.
- Without manual confirmation from current HeroUI docs, compatibility cannot be certified.
- A direct install/adoption recommendation is therefore blocked.

## React version risk
- Unknown until HeroUI requirements are manually verified against React 18.3.1.
- Risk level: **medium** (potential peer dependency mismatch).

## Tailwind version risk
- Unknown until HeroUI setup requirements are manually verified against Tailwind 3.4.7 and existing Tailwind content scanning rules.
- Risk level: **medium to high** (UI libraries often require specific Tailwind/plugin setup).

## Required dependency changes if adopted
- **Not authoritatively determinable in this pass**.
- Expected category (to verify later): new UI library dependencies and possible utility companions.
- Constraint for future phase: perform changes only in a dedicated branch with lockfile review and full regression run.

## Required config changes if adopted
- **Not authoritatively determinable in this pass**.
- Expected category (to verify later): Tailwind/PostCSS content/plugin integration and provider/theme setup in app shell.
- Constraint for future phase: no runtime behavior or analytics logic changes coupled with UI library integration.

## Risks to current dashboard
- Style-token divergence from existing semantic colors (`pivot1`, `pivot2`, `weather`, `anomaly`, `missing`, `warning`).
- Potential inconsistency with current deterministic-vs-Gemini visual boundaries.
- Possible regression in dense diagnostics and processed-data table readability.
- Increased complexity in mobile nav and drawer interactions already tuned in current AppShell/layout patterns.

## Safe adoption options
1. **Adopt limited visual style without installing**
   - Keep current dependencies and implement only design-token and component-pattern standardization with Tailwind utilities.
2. **Adopt only after upgrade plan**
   - First produce a compatibility matrix from manual HeroUI docs, then run staged UI-only migration.
3. **Do not adopt now**
   - Continue with internal design-system hardening; revisit HeroUI after manual verification.

## Recommendation
**Adopt HeroUI only after React 19 and Tailwind CSS v4 migration plan is executed and validated.**

Rationale:
- User-provided HeroUI v3 requirements require React 19+ and Tailwind CSS v4.
- Current project is React 18.3.1 and Tailwind 3.4.7, which is a direct compatibility mismatch.
- Direct HeroUI installation should remain blocked until staged compatibility migration (React -> Tailwind -> HeroUI infrastructure) is complete and validated.
