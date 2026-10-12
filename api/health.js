"use strict";

// Simple health check: GET /api/health
module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      status: "ok",
      service: "calculator-api",
      time: new Date().toISOString(),
    })
  );
};
