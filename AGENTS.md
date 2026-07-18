# L19 student starter instructions

The task is limited to the unexpected failure path of `POST /api/tickets`.

- Use pnpm only.
- Keep the existing API contract and SQLite persistence.
- Treat request data as untrusted at every output boundary.
- Do not include ticket text, request bodies or technical exception details in
  the public response or internal event.
- Keep known validation failures as `400 VALIDATION_ERROR`.
- Do not edit `scripts/check-l19.js` to obtain green.
- Avoid new dependencies and broad logging abstractions.
- Verify with `pnpm check`, `pnpm test` and `pnpm check:l19`.
