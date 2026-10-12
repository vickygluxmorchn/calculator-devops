"use strict";

const SYMBOLS = { add: "+", subtract: "−", multiply: "×", divide: "÷" };

const state = {
  current: "0",          // number currently being typed / shown
  previous: null,        // first operand
  operation: null,       // pending operation
  awaitingSecond: false, // true right after an operator is chosen
  justEvaluated: false,  // true right after "=" so the next digit starts fresh
};

const outputEl = document.getElementById("output");
const expressionEl = document.getElementById("expression");
const errorEl = document.getElementById("error");
const statusEl = document.getElementById("api-status");
const keysEl = document.querySelector(".keys");

function render() {
  outputEl.textContent = state.awaitingSecond ? state.previous : state.current;
  expressionEl.textContent = state.operation
    ? `${state.previous} ${SYMBOLS[state.operation]}`
    : "\u00A0";

  document.querySelectorAll(".operator").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.operation === state.operation);
  });
}

function showError(message) {
  errorEl.textContent = message || "";
}

function startFreshIfNeeded() {
  if (state.justEvaluated) {
    state.current = "0";
    state.justEvaluated = false;
  }
  if (state.awaitingSecond) {
    state.current = "0";
    state.awaitingSecond = false;
  }
}

function inputDigit(d) {
  showError("");
  startFreshIfNeeded();
  if (state.current === "0") {
    state.current = d;
  } else if (state.current === "-0") {
    state.current = "-" + d;
  } else if (state.current.length < 15) {
    state.current += d;
  }
}

function inputDecimal() {
  showError("");
  startFreshIfNeeded();
  if (!state.current.includes(".")) state.current += ".";
}

function negate() {
  if (state.awaitingSecond || state.current === "0") return;
  state.current = state.current.startsWith("-")
    ? state.current.slice(1)
    : "-" + state.current;
}

function backspace() {
  if (state.justEvaluated || state.awaitingSecond) return;
  state.current =
    state.current.length > 1 ? state.current.slice(0, -1) : "0";
  if (state.current === "-") state.current = "0";
}

function clearAll() {
  state.current = "0";
  state.previous = null;
  state.operation = null;
  state.awaitingSecond = false;
  state.justEvaluated = false;
  showError("");
}

function setBusy(busy) {
  keysEl.querySelectorAll("button").forEach((b) => (b.disabled = busy));
}

async function callApi(a, b, operation) {
  const params = new URLSearchParams({ a, b, operation });
  const response = await fetch(`/api/calculate?${params.toString()}`);
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Unexpected response from the server.");
  }
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data.result;
}

async function evaluate() {
  if (!state.operation || state.previous === null || state.awaitingSecond) return;
  setBusy(true);
  try {
    const result = await callApi(state.previous, state.current, state.operation);
    state.current = String(result);
    state.previous = null;
    state.operation = null;
    state.justEvaluated = true;
    showError("");
  } catch (err) {
    showError(err.message);
  } finally {
    setBusy(false);
    render();
  }
}

async function chooseOperation(op) {
  showError("");

  // Pressing two operators in a row just replaces the operator
  if (state.operation && state.awaitingSecond) {
    state.operation = op;
    render();
    return;
  }

  // Chaining: 2 + 3 + ... evaluates 2 + 3 first
  if (state.operation && !state.awaitingSecond) {
    setBusy(true);
    try {
      const result = await callApi(state.previous, state.current, state.operation);
      state.previous = String(result);
    } catch (err) {
      showError(err.message);
      setBusy(false);
      render();
      return;
    }
    setBusy(false);
  } else {
    state.previous = state.current;
  }

  state.operation = op;
  state.awaitingSecond = true;
  state.justEvaluated = false;
  render();
}

keysEl.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn || btn.disabled) return;

  if (btn.dataset.digit !== undefined) {
    inputDigit(btn.dataset.digit);
    render();
  } else if (btn.dataset.operation) {
    chooseOperation(btn.dataset.operation);
  } else {
    switch (btn.dataset.action) {
      case "decimal": inputDecimal(); render(); break;
      case "negate": negate(); render(); break;
      case "backspace": backspace(); render(); break;
      case "clear": clearAll(); render(); break;
      case "equals": evaluate(); break;
    }
  }
});

// Keyboard support
document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") { inputDigit(e.key); render(); }
  else if (e.key === ".") { inputDecimal(); render(); }
  else if (e.key === "+") chooseOperation("add");
  else if (e.key === "-") chooseOperation("subtract");
  else if (e.key === "*") chooseOperation("multiply");
  else if (e.key === "/") { e.preventDefault(); chooseOperation("divide"); }
  else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); evaluate(); }
  else if (e.key === "Backspace") { backspace(); render(); }
  else if (e.key === "Escape") { clearAll(); render(); }
});

// API health indicator
async function checkHealth() {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) throw new Error();
    statusEl.textContent = "online";
    statusEl.className = "ok";
  } catch {
    statusEl.textContent = "offline";
    statusEl.className = "down";
  }
}

render();
checkHealth();
