let parser = null;

function init() {
  parser = new PredictiveParser();
  displayGrammar();
  displayFirstAndFollow();
  displayParsingTable();
  setupEventListeners();
}

function displayGrammar() {
  const grammarDisplay = document.getElementById("grammarDisplay");
  let html = '<div class="grammar-rules">';

  for (const [nonTerminal, productions] of Object.entries(grammar)) {
    html += `<div class="grammar-rule">`;
    html += `<span class="non-terminal">${nonTerminal}</span> → `;

    const productionStrings = productions.map((prod) => {
      if (prod.length === 0 || prod[0] === "ε") {
        return "ε";
      }
      return prod.join(" ");
    });

    html += productionStrings.join(" | ");
    html += `</div>`;
  }

  html += "</div>";
  grammarDisplay.innerHTML = html;
}

function displayFirstAndFollow() {
  const firstSets = getAllFirstSets();
  const followSets = getAllFollowSets();

  const firstDisplay = document.getElementById("firstSets");
  const followDisplay = document.getElementById("followSets");

  let firstHtml = '<div class="sets-list">';
  for (const [nt, firstSet] of Object.entries(firstSets)) {
    const sortedFirst = Array.from(firstSet).sort();
    firstHtml += `<div class="set-item">`;
    firstHtml += `<strong>FIRST(${nt})</strong> = { ${sortedFirst.join(
      ", "
    )} }`;
    firstHtml += `</div>`;
  }
  firstHtml += "</div>";
  firstDisplay.innerHTML = firstHtml;

  let followHtml = '<div class="sets-list">';
  for (const [nt, followSet] of Object.entries(followSets)) {
    const sortedFollow = Array.from(followSet).sort();
    followHtml += `<div class="set-item">`;
    followHtml += `<strong>FOLLOW(${nt})</strong> = { ${sortedFollow.join(
      ", "
    )} }`;
    followHtml += `</div>`;
  }
  followHtml += "</div>";
  followDisplay.innerHTML = followHtml;
}

function displayParsingTable() {
  const table = createParsingTable();
  const tableDisplay = document.getElementById("parsingTable");

  let html = '<table class="parsing-table"><thead><tr>';
  html += "<th>Não-Terminal</th>";
  for (const t of terminals) {
    html += `<th>${t}</th>`;
  }
  html += "</tr></thead><tbody>";

  for (const nt of nonTerminals) {
    html += "<tr>";
    html += `<td><strong>${nt}</strong></td>`;
    for (const t of terminals) {
      const production = table[nt][t];
      html += "<td>";
      if (production === null || production === undefined) {
        html += '<span class="empty-cell">-</span>';
      } else {
        const prodStr =
          production.length === 0 || production[0] === "ε"
            ? "ε"
            : production.join(" ");
        html += `<span class="production-cell">${prodStr}</span>`;
      }
      html += "</td>";
    }
    html += "</tr>";
  }

  html += "</tbody></table>";
  tableDisplay.innerHTML = html;
}

function setupEventListeners() {
  document.getElementById("analyzeBtn").addEventListener("click", () => {
    const input = document.getElementById("sentenceInput").value.trim();
    if (input === "") {
      alert("Por favor, digite uma sentença para analisar.");
      return;
    }
    analyzeSentence(input);
  });

  document.getElementById("sentenceInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      document.getElementById("analyzeBtn").click();
    }
  });

  document.getElementById("generateBtn").addEventListener("click", () => {
    generateInteractiveSentence();
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    document.getElementById("sentenceInput").value = "";
    document.getElementById("resultDisplay").innerHTML = "";
    document.getElementById("traceDisplay").innerHTML = "";
    document.getElementById("stepCount").textContent = "Passos: 0";
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    parser = new PredictiveParser();
    document.getElementById("sentenceInput").value = "";
    document.getElementById("resultDisplay").innerHTML = "";
    document.getElementById("traceDisplay").innerHTML = "";
    document.getElementById("stepCount").textContent = "Passos: 0";
  });
}

function analyzeSentence(input) {
  const result = parser.analyze(input);

  const resultDisplay = document.getElementById("resultDisplay");
  let resultHtml = '<div class="result-box">';

  if (result.accepted) {
    resultHtml += '<div class="result-success">';
    resultHtml += "<h3>✓ Sentença ACEITA</h3>";
    resultHtml += `<p>A sentença "${input}" foi aceita pela gramática.</p>`;
    resultHtml += `<p><strong>Número de passos:</strong> ${result.steps}</p>`;
    resultHtml += "</div>";
  } else {
    resultHtml += '<div class="result-error">';
    resultHtml += "<h3>✗ Sentença REJEITADA</h3>";
    resultHtml += `<p>A sentença "${input}" foi rejeitada pela gramática.</p>`;
    if (result.error) {
      resultHtml += `<p><strong>Erro:</strong> ${result.error}</p>`;
    }
    resultHtml += `<p><strong>Número de passos:</strong> ${result.steps}</p>`;
    resultHtml += "</div>";
  }

  resultHtml += "</div>";
  resultDisplay.innerHTML = resultHtml;

  displayTrace(result.trace);
  document.getElementById("stepCount").textContent = `Passos: ${result.steps}`;
}

function displayTrace(trace) {
  const traceDisplay = document.getElementById("traceDisplay");

  if (trace.length === 0) {
    traceDisplay.innerHTML = "<p>Nenhum traço disponível.</p>";
    return;
  }

  let html = '<table class="trace-table"><thead><tr>';
  html += "<th>Passo</th>";
  html += "<th>Pilha</th>";
  html += "<th>Entrada</th>";
  html += "<th>Ação</th>";
  html += "</tr></thead><tbody>";

  for (const step of trace) {
    const isError = step.action.includes("ERRO");
    const isAccepted = step.action.includes("Aceito");
    html +=
      '<tr class="' +
      (isError ? "error-row" : isAccepted ? "accepted-row" : "") +
      '">';
    html += `<td>${step.step}</td>`;
    html += `<td><code>${step.stack || "ε"}</code></td>`;
    html += `<td><code>${step.input}</code></td>`;
    html += `<td>${step.action}</td>`;
    html += "</tr>";
  }

  html += "</tbody></table>";
  traceDisplay.innerHTML = html;
}

function generateInteractiveSentence() {
  const generation = parser.generateInteractive();

  let stepsHtml = '<div class="generation-steps">';
  stepsHtml += "<h3>Geração da Sentença:</h3>";
  stepsHtml += '<div class="derivation-steps">';

  stepsHtml += `<div class="derivation-step">`;
  stepsHtml += `<strong>Passo 0:</strong> ${startSymbol}`;
  stepsHtml += `</div>`;

  for (const step of generation.steps) {
    stepsHtml += `<div class="derivation-step">`;
    stepsHtml += `<strong>Passo ${step.step}:</strong> ${step.derivation}`;
    stepsHtml += ` <span class="production-info">(${step.production})</span>`;
    stepsHtml += `</div>`;
  }

  stepsHtml += "</div>";
  stepsHtml += `<div class="generated-sentence">`;
  stepsHtml += `<strong>Sentença gerada:</strong> <code>${
    generation.sentence || "ε"
  }</code>`;
  if (generation.sentence) {
    stepsHtml += `<button id="analyzeGeneratedBtn" class="analyze-generated-btn">Analisar Sentença Gerada</button>`;
  }
  stepsHtml += `</div>`;
  stepsHtml += "</div>";

  document.getElementById("sentenceInput").value = generation.sentence;

  const resultDisplay = document.getElementById("resultDisplay");
  resultDisplay.innerHTML = stepsHtml;

  if (generation.sentence) {
    const analyzeGeneratedBtn = document.getElementById("analyzeGeneratedBtn");
    if (analyzeGeneratedBtn) {
      analyzeGeneratedBtn.addEventListener("click", () => {
        analyzeSentence(generation.sentence);
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", init);
