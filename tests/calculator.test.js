"use strict";

const test = require("node:test");
const assert = require("node:assert");
const { calculate } = require("../lib/calculator");

test("adds two numbers", () => {
  assert.deepStrictEqual(calculate(2, 3, "add"), { status: 200, result: 5 });
});

test("subtracts two numbers", () => {
  assert.strictEqual(calculate(10, 4, "subtract").result, 6);
});

test("multiplies two numbers", () => {
  assert.strictEqual(calculate(6, 7, "multiply").result, 42);
});

test("divides two numbers", () => {
  assert.strictEqual(calculate(20, 5, "divide").result, 4);
});

test("handles floating point noise", () => {
  assert.strictEqual(calculate(0.1, 0.2, "add").result, 0.3);
});

test("rejects division by zero", () => {
  const out = calculate(5, 0, "divide");
  assert.strictEqual(out.status, 400);
  assert.match(out.error, /divide by zero/i);
});

test("rejects invalid operation", () => {
  assert.strictEqual(calculate(1, 2, "power").status, 400);
});

test("rejects non-numeric input", () => {
  assert.strictEqual(calculate("abc", 2, "add").status, 400);
});

test("rejects missing input", () => {
  assert.strictEqual(calculate(undefined, 2, "add").status, 400);
  assert.strictEqual(calculate("", 2, "add").status, 400);
});

test("rejects values above the max limit", () => {
  assert.strictEqual(calculate(1000, 1, "add", 100).status, 400);
});

test("accepts negative numbers", () => {
  assert.strictEqual(calculate(-5, -3, "multiply").result, 15);
});
