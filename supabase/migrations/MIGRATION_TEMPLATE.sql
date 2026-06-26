-- ┌─────────────────────────────────────────────────────────────────┐
-- │  MIGRATION SAFETY CHECKLIST — fill in before committing         │
-- │  [ ] RLS enabled on every new table?                            │
-- │  [ ] No policy uses `using (true)` or `to anon`?               │
-- │  [ ] Identity comes from auth.uid(), not a client-supplied col? │
-- │  [ ] Any new column holding user data has a matching policy?    │
-- │  [ ] activity_type (or equivalent enum) enforced by CHECK?      │
-- └─────────────────────────────────────────────────────────────────┘

-- your migration SQL below
