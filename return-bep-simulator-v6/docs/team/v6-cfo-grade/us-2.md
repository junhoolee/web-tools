# US-2: Scenario B Independent Volume

## User Story
As a pricing analyst, I want Scenario B to calculate its own volume adjustment based on `priceB`, so that the P&L comparison between scenarios reflects realistic volume differences.

## Acceptance Criteria
- [ ] AC-2.1: `computeAll` calls `calcVolume({...i, price: i.priceB})` separately when `compareOn` is true
- [ ] AC-2.2: Scenario B's loss calculation (`Lb`) uses `volB.adjShip`, `volB.adjLabor`, `volB.adjPack`, `volB.adjSalv` instead of Scenario A's volume adjustments
- [ ] AC-2.3: `SimulatorDerived` includes `volB?: VolumeResult` field
- [ ] AC-2.4: `PLPanel` uses `volB.adjVol` (not `vol.adjVol`) for Scenario B revenue and profit calculations
- [ ] AC-2.5: When `compareOn` is false, `volB` is `undefined` (no unnecessary computation)

## Notes
- Current bug: line 222 in `useSimulatorState.ts` passes `vol.adjShip/adjLabor/adjPack/adjSalv` (Scenario A's values) to Scenario B's `computeScenarioL`
- `calcVolume` computes volume elasticity based on price — different prices must produce different volumes
- This is a P&L accuracy issue that directly affects CFO-level decision quality
