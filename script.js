const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keys = document.querySelector(".keys");

let currentValue = "0";
let storedValue = null;
let pendingOperator = null;
let replaceCurrent = false;

const operatorSymbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

function render() {
  display.textContent = currentValue;
  expression.textContent = storedValue !== null && pendingOperator
    ? `${storedValue} ${operatorSymbols[pendingOperator]}`
    : "\u00a0";
}

function formatResult(value) {
  if (!Number.isFinite(value)) return "Error";
  // Avoid displaying floating-point rounding noise while retaining useful precision.
  return String(Number(value.toPrecision(12)));
}

function enterDigit(digit) {
  if (currentValue === "Error" || replaceCurrent) {
    currentValue = digit;
    replaceCurrent = false;
  } else if (currentValue === "0") {
    currentValue = digit;
  } else if (currentValue.length < 16) {
    currentValue += digit;
  }
  render();
}

function enterDecimal() {
  if (currentValue === "Error" || replaceCurrent) {
    currentValue = "0.";
    replaceCurrent = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
  render();
}

function calculate(left, right, operator) {
  switch (operator) {
    case "+": return left + right;
    case "-": return left - right;
    case "*": return left * right;
    case "/": return right === 0 ? NaN : left / right;
    default: return right;
  }
}

function chooseOperator(operator) {
  if (currentValue === "Error") return;
  const value = Number(currentValue);

  if (pendingOperator && storedValue !== null && !replaceCurrent) {
    const result = calculate(storedValue, value, pendingOperator);
    currentValue = formatResult(result);
    if (currentValue === "Error") {
      storedValue = null;
      pendingOperator = null;
      replaceCurrent = true;
      render();
      return;
    }
    storedValue = Number(currentValue);
  } else {
    storedValue = value;
  }

  pendingOperator = operator;
  replaceCurrent = true;
  render();
}

function showResult() {
  if (!pendingOperator || storedValue === null || currentValue === "Error") return;
  const left = storedValue;
  const right = Number(currentValue);
  const operator = pendingOperator;
  currentValue = formatResult(calculate(left, right, operator));
  expression.textContent = `${left} ${operatorSymbols[operator]} ${right} =`;
  storedValue = null;
  pendingOperator = null;
  replaceCurrent = true;
  renderExpressionOnly();
}

function renderExpressionOnly() {
  display.textContent = currentValue;
}

function clear() {
  currentValue = "0";
  storedValue = null;
  pendingOperator = null;
  replaceCurrent = false;
  render();
}

function deleteLast() {
  if (currentValue === "Error" || replaceCurrent) {
    currentValue = "0";
    replaceCurrent = false;
  } else {
    currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
    if (currentValue === "-" || currentValue === "") currentValue = "0";
  }
  render();
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.digit !== undefined) enterDigit(button.dataset.digit);
  else if (button.dataset.operator) chooseOperator(button.dataset.operator);
  else if (button.dataset.action === "decimal") enterDecimal();
  else if (button.dataset.action === "equals") showResult();
  else if (button.dataset.action === "clear") clear();
  else if (button.dataset.action === "delete") deleteLast();
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) enterDigit(event.key);
  else if (event.key === ".") enterDecimal();
  else if (["+", "-", "*", "/"].includes(event.key)) chooseOperator(event.key);
  else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    showResult();
  } else if (event.key === "Backspace") deleteLast();
  else if (event.key === "Escape") clear();
});

render();
