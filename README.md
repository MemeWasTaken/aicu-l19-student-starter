# L19 - Starter studenti

La feature funziona nel percorso positivo, ma un guasto inatteso espone troppo
nella response pubblica e costruisce un evento ambiguo usando testo non fidato.

## Requisiti

- Node.js 26 o successivo;
- pnpm 10 o successivo.

## Setup

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm check:l19
```

`pnpm check:l19` e' intenzionalmente rosso all'inizio. Leggere `consegna.md`
prima di modificare il server.
