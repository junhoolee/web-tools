# US-4: Vitest Unit Tests

## User Story
As a developer, I want automated unit tests for all core math functions, so that regressions are caught before deployment and the calculation logic is verified.

## Acceptance Criteria
- [ ] AC-4.1: Vitest is configured in the project (`vitest.config.ts` or in `vite.config.ts`)
- [ ] AC-4.2: `weibull.ts` tests cover `wR`, `calLam`, `bepDay` with known input/output pairs
- [ ] AC-4.3: `cost.ts` tests cover `calcL` for all three recovery paths (`salvage`, `refurb`, `mixed`)
- [ ] AC-4.4: `volume.ts` tests cover `calcVolume` including elasticity boundary values (zero elasticity, extreme price ratios)
- [ ] AC-4.5: `sensitivity.ts` tests verify tornado chart symmetry (`calcSensitivity`)
- [ ] AC-4.6: `computeAll` boundary tests cover error cases (e.g., `price <= 0`, `r14 >= Rinf`, `k <= 0`)
- [ ] AC-4.7: All tests pass via `npx vitest run` with zero failures

## Notes
- Vitest integrates natively with Vite projects — minimal setup required
- Test files should be colocated: `src/lib/__tests__/weibull.test.ts`, etc.
- Focus on deterministic math verification, not UI rendering
