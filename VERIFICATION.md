# Verification

- Production build: passed (Vite).
- Browser runtime: no console errors during tested flows.
- Customer onboarding: created a demo customer; verified automatic installation request.
- Field service: completion disabled until checklist complete; completed installation and confirmed customer Active in directory.
- Billing: recorded a seeded overdue payment and verified Paid invoice state.
- Support: resolved seeded ticket and verified open-ticket count decreased.
- Responsive: checked dashboard and customer directory at 390px; document width equals viewport width; mobile navigation worked.
- Desktop: reviewed rendered 1440px dashboard, charts, health gauge, topology, sidebar, and activity feed.
- Persistence: reloaded page and confirmed changed ticket count persisted.

Demo-only boundaries: illustrative network telemetry, simulated role perspectives, no backend authentication, no payment processing, no external integrations. Operational changes stay in localStorage. Test-created “Demo Test Customer” remains available in the preview to inspect the completed onboarding flow.
