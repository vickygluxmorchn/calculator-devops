"use strict";

const { calculate } = require("../lib/calculator");

// Vercel serverless function: GET or POST /api/calculate
module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET" && req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed. Use GET or POST." }));
    return;
  }

  const source = req.method === "POST" && req.body ? req.body : req.query;
  const { a, b, operation } = source || {};

  const maxValue = process.env.MAX_INPUT_VALUE
    ? Number(process.env.MAX_INPUT_VALUE)
    : Infinity;

  const outcome = calculate(a, b, operation, maxValue);

  res.statusCode = outcome.status;
  if (outcome.error) {
    res.end(JSON.stringify({ error: outcome.error }));
  } else {
    res.end(
      JSON.stringify({
        a: Number(a),
        b: Number(b),
        operation,
        result: outcome.result,
      })
    );
  }
};
