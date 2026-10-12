"use strict";

const OPERATIONS = ["add", "subtract", "multiply", "divide"];

/**
 * Perform a calculation and return { status, result } or { status, error }.
 * maxValue limits the absolute size of the inputs.
 */
function calculate(rawA, rawB, operation, maxValue = Infinity) {
  if (!OPERATIONS.includes(operation)) {
    return {
      status: 400,
      error: `Invalid operation. Use one of: ${OPERATIONS.join(", ")}`,
    };
  }

  if (
    rawA === undefined || rawA === null || String(rawA).trim() === "" ||
    rawB === undefined || rawB === null || String(rawB).trim() === ""
  ) {
    return { status: 400, error: "Both 'a' and 'b' are required." };
  }

  const a = Number(rawA);
  const b = Number(rawB);

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return { status: 400, error: "'a' and 'b' must be valid numbers." };
  }

  if (Math.abs(a) > maxValue || Math.abs(b) > maxValue) {
    return { status: 400, error: `Inputs must not exceed ${maxValue}.` };
  }

  let result;
  switch (operation) {
    case "add":
      result = a + b;
      break;
    case "subtract":
      result = a - b;
      break;
    case "multiply":
      result = a * b;
      break;
    case "divide":
      if (b === 0) {
        return { status: 400, error: "Cannot divide by zero." };
      }
      result = a / b;
      break;
  }

  // Avoid floating point noise such as 0.1 + 0.2 = 0.30000000000000004
  result = Math.round(result * 1e10) / 1e10;

  return { status: 200, result };
}

module.exports = { calculate, OPERATIONS };
