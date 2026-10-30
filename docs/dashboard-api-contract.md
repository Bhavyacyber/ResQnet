# RESQNET Command & Control Dashboard API Contract

> **Proposal only — not an approved API contract.** The endpoints, request and
> response schemas, fields, and behaviors below are **PROPOSED** and require
> approval from Manvitha and Medha before implementation. No live backend
> integration is established by this document or by the current dashboard.

This document outlines a possible integration between RESQNET gateways, the
backend, and the Command & Control Dashboard. It does not assert that any of
the proposed endpoints exist.

## 1. Gateway-to-backend incident ingestion

**PROPOSED — unapproved endpoint:** `POST /api/v1/incidents/ingest`

The gateway would submit an encrypted incident envelope to the backend. The
backend's agreed verification and processing procedure—not a gateway- or
dashboard-supplied verification claim—must determine whether the incident is
authentic, authorized, and decryptable.

**PROPOSED request schema (illustrative):**

```json
{
  "protocol_version": "proposed-version",
  "message_id": "stable-message-id",
  "gateway_metadata": {
    "gateway_id": "gateway-id"
  },
  "encrypted_envelope": {
    "ciphertext": "base64-encoded-ciphertext",
    "nonce": "base64-encoded-nonce",
    "encryption_metadata": {}
  }
}
```

All field names, types, required fields, encoding, and envelope details in this
example are **PROPOSED**. The envelope is illustrative only; cryptographic
algorithms, key identifiers, signature placement, and metadata must be agreed
as part of the gateway trust architecture. Do not put keys or other secrets in
frontend code.

**Open approval required:** Define duplicate handling for repeated
`message_id` values and the HTTP response semantics, including status codes,
response body, retry behavior, and whether a response acknowledges receipt,
successful verification, durable storage, or dashboard delivery. No
acknowledgement meaning is implied here.

## 2. Backend-to-dashboard incident retrieval

**PROPOSED — unapproved endpoint:** `GET /api/v1/dashboard/incidents`

This is a candidate read interface for registered incidents; it is not a
statement that this route or an equivalent backend endpoint currently exists.

**PROPOSED response schema (illustrative):**

```json
{
  "incidents": [
    {
      "incident_id": "stable-incident-id",
      "message_id": "stable-message-id",
      "category": "category-value",
      "priority": "priority-value",
      "timestamp": "ISO-8601 timestamp",
      "location": null,
      "delivery_state": "RECEIVED_BY_GATEWAY",
      "verification": {
        "signature_verification": "pending",
        "sender_authorization": "pending",
        "decryption": "pending"
      }
    }
  ]
}
```

Every field, status value, and response shape above is **PROPOSED**. `location`
is optional and should be included only when available and approved for
dashboard exposure. The meanings, permitted values, source of truth, and
disclosure rules for category, priority, timestamps, location, and verification
results need approval. The dashboard must not trust a client-provided
`verified` flag or `verified_payload`; it may display verification results only
when produced through the agreed backend verification procedure.

### Proposed delivery-state vocabulary

The following canonical labels from the RESQNET draft are included as
**PROPOSED** `delivery_state` values where applicable:

- `READY`
- `PREPARING_SOS`
- `QUEUED_OFFLINE`
- `TRANSMITTING`
- `FORWARDED_TO_PEER`
- `RECEIVED_BY_GATEWAY`
- `DELIVERED_TO_DASHBOARD`
- `EXPIRED`
- `REJECTED_OR_FAILED`

The authorized transitions, precise meanings, and component responsible for
reporting each state remain unapproved. A delivery state must not be presented
as proof of signature validity, sender authorization, or successful
decryption.

## 3. Backend-to-dashboard gateway status

**PROPOSED — unapproved endpoint:** `GET /api/v1/dashboard/gateways/status`

This candidate interface would provide gateway status to the dashboard.

**PROPOSED response schema (illustrative):**

```json
{
  "gateways": [
    {
      "gateway_id": "gateway-id",
      "availability": "unknown",
      "last_seen": null,
      "connection_state": "unknown"
    }
  ]
}
```

All fields, values, freshness rules, and the response shape are **PROPOSED**.
The backend and gateway teams must define availability and connection-state
semantics, what `last_seen` represents, and when status becomes stale.

## 4. Backend-to-dashboard security events

**PROPOSED — unapproved endpoint:** `GET /api/v1/dashboard/security-events`

This candidate interface would expose security-relevant processing outcomes
for dashboard display.

**PROPOSED response schema (illustrative):**

```json
{
  "events": [
    {
      "event_id": "stable-event-id",
      "event_type": "event-type",
      "timestamp": "ISO-8601 timestamp",
      "message_id": "stable-message-id",
      "node_id": null,
      "verification_outcome": {
        "signature_verification": "pending",
        "sender_authorization": "pending",
        "decryption": "pending"
      }
    }
  ]
}
```

All fields, values, and the response shape are **PROPOSED**. `message_id` and
`node_id` are optional where unavailable. The verification outcome must keep
these separate:

- **Signature verification** reports whether the cryptographic signature was
  checked and whether it passed.
- **Sender authorization** reports whether the identified sender was
  permitted to submit that message. A valid signature alone does not establish
  authorization.
- **Decryption** reports whether the encrypted content could be decrypted
  under the agreed procedure. Successful decryption alone does not establish
  signature validity or sender authorization.

The procedure, outcome vocabulary, and event-disclosure policy require
approval. Do not accept client-supplied verification outcomes as authoritative.

## Decisions requiring approval from Manvitha and Medha

Before any endpoint or schema is implemented, obtain approval for:

1. **Gateway trust architecture:** gateway identity, key and certificate
   lifecycle, signing and encryption responsibilities, key rotation, and the
   backend's verification procedure.
2. **Authentication and authorization:** gateway and dashboard credentials,
   backend authorization rules, credential storage, and deployment-specific
   access controls. Secrets must remain out of frontend code.
3. **Endpoint paths and API conventions:** approve or replace every proposed
   path above, plus versioning, environments, pagination, filtering, and
   transport requirements.
4. **Acknowledgement and duplicate semantics:** define what ingestion success
   acknowledges, duplicate `message_id` behavior, response codes and bodies,
   retries, idempotency, and failure handling.
5. **Schema and state semantics:** approve field names and types, required and
   optional data, timestamp and location policies, delivery-state transitions,
   verification outcome values, and authoritative source for each value.
6. **Dashboard behavior and data access:** approve freshness, retention,
   access to incident and security data, and how partial or unavailable data is
   represented.

Until these decisions are approved and the backend is implemented and
configured, this document remains a proposal only. The dashboard has no live
backend integration established by this proposal.
