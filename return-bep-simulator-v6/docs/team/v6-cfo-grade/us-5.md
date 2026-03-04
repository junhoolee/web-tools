# US-5: Domain Documentation

## User Story
As a CFO or finance stakeholder, I want clear documentation of the simulator's mathematical model and assumptions, so that I can evaluate its validity before using it for policy decisions.

## Acceptance Criteria
- [ ] AC-5.1: `README.md` is replaced with domain-specific documentation (no Vite boilerplate remains)
- [ ] AC-5.2: Model overview section explains Weibull CDF return rate curve and BEP formula
- [ ] AC-5.3: Key assumptions section lists all model assumptions and their justifications
- [ ] AC-5.4: Data sources section documents where input default values originate
- [ ] AC-5.5: Input ranges table documents valid min/max for every `SimulatorInputs` field
- [ ] AC-5.6: Validation procedures section describes how to verify model output
- [ ] AC-5.7: Changelog section tracks version history

## Notes
- Current README is Vite's default "React + TypeScript + Vite" template
- Target audience is non-technical decision makers — avoid jargon where possible
- Mathematical formulas should use clear notation (LaTeX-style or plain text)
