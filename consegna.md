# L19 - Quando qualcosa fallisce

Chiudere il failure path inatteso di `POST /api/tickets` con una modifica
piccola e verificabile.

## Contratto da ottenere

- il guasto inatteso restituisce `500`;
- la response usa `code: INTERNAL_ERROR` e un messaggio stabile;
- la response non contiene dettagli SQLite;
- l'evento interno contiene soltanto `operation`, `errorCode` e `requestId`;
- il testo libero del ticket non entra nell'evento;
- un input noto non valido resta `400 VALIDATION_ERROR`;
- il tentativo fallito non aggiunge righe al database.

## Flusso di lavoro

```bash
pnpm check:l19
pnpm test
pnpm check
```

Scegliere un rosso, seguire il percorso fino al primo confine responsabile,
applicare la modifica minima e rieseguire l'intero check.

Non modificare `scripts/check-l19.js`, non loggare il body completo, non
aggiungere dipendenze e non trasformare il task in un refactor generale.
