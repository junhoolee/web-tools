# US-1: Build Fix

## User Story
As a developer, I want the project to compile without errors, so that the team can deploy and iterate on new features.

## Acceptance Criteria
- [ ] AC-1.1: `SimulatorInputs` in `src/types/simulator.ts` includes `fixedCost: number`
- [ ] AC-1.2: `initialInputs` in `src/hooks/useSimulatorState.ts` includes `fixedCost: 0`
- [ ] AC-1.3: Unused `dispatch` prop is removed from `MainPanel.tsx`
- [ ] AC-1.4: `npm run build` completes with zero TypeScript errors and zero warnings

## Notes
- This is the highest priority fix — all other US depend on a green build
- `FixedCostSection.tsx` already references `fixedCost` from inputs; the type just needs to exist
- US-6 (FixedCost Feature Completion) builds on top of this fix
