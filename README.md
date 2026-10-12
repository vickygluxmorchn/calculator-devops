# DevOps Calculator

A calculator web app backed by a serverless API, with automated tests (GitHub Actions) and continuous deployment (Vercel).

## API

| Endpoint | Description |
|---|---|
| `GET /api/calculate?a=6&b=3&operation=divide` | Returns `{ "a": 6, "b": 3, "operation": "divide", "result": 2 }` |
| `GET /api/health` | Returns `{ "status": "ok" }` |

Operations: `add`, `subtract`, `multiply`, `divide`.

## Environment variables

| Name | Purpose |
|---|---|
| `MAX_INPUT_VALUE` | Optional. Reject inputs whose absolute value exceeds this number. |

## Run tests

```
npm test
```

## Run locally

```
npm install -g vercel
vercel dev
```
