# L19 - Chiudere un failure path inatteso

  ## Obiettivo

  Correggi la gestione degli errori inattesi di `POST /api/tickets`.

  Devi separare:

  - ciò che può vedere il client;
  - ciò che serve al team nel log interno;
  - ciò che non deve essere esposto o registrato.

  Applica una modifica piccola e verificabile. Non costruire un nuovo sistema
  di logging.

  ## Situazione iniziale

  La repo contiene intenzionalmente un failure path non sicuro:

  - la response espone un dettaglio SQLite;
  - il log concatena il titolo non fidato del ticket;
  - il checker L19 parte con quattro controlli rossi.

  Esegui:

  ```bash
  pnpm install --frozen-lockfile
  pnpm check
  pnpm test
  pnpm check:l19
  ```

  Leggi i controlli rossi prima di modificare il codice.

  ## Contratto da ottenere

  Quando avviene un errore inatteso, il client deve ricevere:

  {
    "code": "INTERNAL_ERROR",
    "message": "Errore interno del server."
  }

  La response deve:

  - mantenere status 500;
  - usare il codice stabile INTERNAL_ERROR;
  - non contenere detail;
  - non esporre messaggi SQLite, stack trace, query o path interni.

  Il server deve produrre un evento interno strutturato con:

  operation: create_ticket
  errorCode: DB_WRITE_FAILED
  requestId: identificatore non vuoto

  L’evento non deve contenere:

  - titolo o descrizione del ticket;
  - request body completo;
  - testo libero non fidato;
  - dettagli SQLite;
  - secret o credenziali.

  ## Regressioni da evitare

  La modifica non deve rompere il comportamento esistente:

  - un input noto non valido continua a restituire 400 VALIDATION_ERROR;
  - il tentativo fallito non aggiunge ticket al database;
  - i test esistenti restano verdi.

  ## Metodo di lavoro

  1. Esegui pnpm check:l19.
  2. Scegli un controllo rosso.
  3. Segui il percorso fino al punto responsabile.
  4. Definisci response pubblica ed evento interno prima della patch.
  5. Applica la modifica minima.
  6. Riesegui:

  pnpm check:l19
  pnpm test
  pnpm check

  ## Uso facoltativo dell’AI

  Puoi usare un agente per analizzare il problema, ma non delegargli
  automaticamente la modifica.

  Analizza esclusivamente i controlli rossi di pnpm check:l19 relativi al
  failure path di POST /api/tickets.

  Non modificare scripts/check-l19.js, non usare la rete e non ampliare lo
  scope.

  Per ogni controllo rosso indica:
  - comportamento osservato;
  - confine responsabile;
  - file minimo coinvolto.

  Proponi un piano massimo di tre passi e attendi la mia approvazione prima
  di
  modificare file.

  Verifica sempre finding, file letti e modifiche proposte.

  ## Vincoli

  Non:

  - modificare scripts/check-l19.js;
  - aggiungere dipendenze;
  - cambiare schema o dati;
  - intervenire sul frontend;
  - aggiungere auth, rate limiting o altre feature;
  - trasformare il task in un refactor generale;
  - consegnare documenti o trascrizioni dell’AI.

  ## Done

  Il lavoro è concluso quando:

  pnpm check:l19
  pnpm test
  pnpm check

  terminano tutti correttamente e il diff contiene soltanto le modifiche
  necessarie.


  La differenza sostanziale è che la review AI è facoltativa; il risultato
  richiesto è la patch verificata dal checker reale.
