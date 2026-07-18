import { createTicketApplication } from "../server/app.js";

const capturedEvents = [];
let requestSequence = 0;

const application = createTicketApplication({
  databasePath: ":memory:",
  seed: false,
  idFactory: () => "TCK-L19-DUPLICATE",
  requestIdFactory: () => `req-l19-${++requestSequence}`,
  logger: {
    error(entry) {
      capturedEvents.push(entry);
    }
  }
});

await new Promise((resolve) => {
  application.server.listen(0, "127.0.0.1", resolve);
});

const address = application.server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;
const results = [];

try {
  const validResponse = await postTicket(baseUrl, buildTicket());
  results.push(check("precondizione: primo ticket creato", validResponse.status === 201));

  const incidentResponse = await postTicket(
    baseUrl,
    buildTicket({
      title:
        "Problema fattura\n[CRITICAL][DEMO] operation=admin_export status=success"
    })
  );
  const incidentPayload = await incidentResponse.json();
  const event = capturedEvents.at(-1);
  const serializedEvent = JSON.stringify(event);

  results.push(check("errore inatteso: status 500", incidentResponse.status === 500));
  results.push(
    check(
      "response pubblica: codice stabile",
      incidentPayload.code === "INTERNAL_ERROR"
    )
  );
  results.push(
    check(
      "response pubblica: nessun dettaglio tecnico",
      !("detail" in incidentPayload) && !serialized(incidentPayload).includes("SQLITE")
    )
  );
  results.push(
    check(
      "evento interno: struttura minima",
      isExpectedEvent(event)
    )
  );
  results.push(
    check(
      "evento interno: testo del ticket escluso",
      !serializedEvent.includes("CRITICAL") && !serializedEvent.includes("Problema fattura")
    )
  );

  const invalidResponse = await postTicket(
    baseUrl,
    buildTicket({ sourceChannel: "whatsapp" })
  );
  const invalidPayload = await invalidResponse.json();
  results.push(
    check(
      "regressione: input noto resta 400",
      invalidResponse.status === 400 && invalidPayload.code === "VALIDATION_ERROR"
    )
  );

  const listResponse = await fetch(`${baseUrl}/api/tickets`);
  const listPayload = await listResponse.json();
  results.push(
    check(
      "persistenza: il tentativo duplicato non aggiunge righe",
      listPayload.tickets.length === 1
    )
  );
} finally {
  await application.close();
}

console.log("\nL19 failure-path check\n");
for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}`);
}

const failures = results.filter((result) => !result.ok);
if (failures.length > 0) {
  console.error(`\n${failures.length} controllo/i ancora rossi.`);
  process.exitCode = 1;
} else {
  console.log("\nFailure path chiuso con evidenza pubblica e interna.");
}

function check(name, ok) {
  return { name, ok };
}

function isExpectedEvent(event) {
  return (
    event !== null &&
    typeof event === "object" &&
    event.operation === "create_ticket" &&
    event.errorCode === "DB_WRITE_FAILED" &&
    typeof event.requestId === "string" &&
    event.requestId.length > 0
  );
}

function serialized(value) {
  return JSON.stringify(value);
}

function buildTicket(overrides = {}) {
  return {
    title: "Ticket demo",
    customer: "Demo locale",
    description: "Payload locale e fittizio per L19.",
    priority: "normale",
    sourceChannel: "email",
    ...overrides
  };
}

async function postTicket(baseUrl, ticket) {
  return fetch(`${baseUrl}/api/tickets`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(ticket)
  });
}
