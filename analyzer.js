class PredictiveParser {
  constructor() {
    this.parsingTable = createParsingTable();
    this.trace = [];
    this.stepCount = 0;
  }

  analyze(input) {
    this.trace = [];
    this.stepCount = 0;

    const inputTokens = input.split("").filter((c) => c.trim() !== "");
    inputTokens.push("$");

    const stack = ["$", startSymbol];
    let inputIndex = 0;

    this.addTraceStep(stack, inputTokens, inputIndex, "Inicialização");

    while (stack.length > 0) {
      this.stepCount++;
      const top = stack[stack.length - 1];
      const currentInput = inputTokens[inputIndex];

      if (isTerminal(top)) {
        if (top === currentInput) {
          if (top === "$") {
            this.addTraceStep(stack, inputTokens, inputIndex, "Aceito!");
            return { accepted: true, trace: this.trace, steps: this.stepCount };
          }
          stack.pop();
          inputIndex++;
          this.addTraceStep(stack, inputTokens, inputIndex, `Match: ${top}`);
        } else {
          this.addTraceStep(
            stack,
            inputTokens,
            inputIndex,
            `ERRO: Esperado ${top}, encontrado ${currentInput}`
          );
          return {
            accepted: false,
            trace: this.trace,
            steps: this.stepCount,
            error: `Erro na posição ${inputIndex}: esperado '${top}', encontrado '${currentInput}'`,
          };
        }
      } else if (isNonTerminal(top)) {
        const production = this.parsingTable[top][currentInput];

        if (production === null || production === undefined) {
          this.addTraceStep(
            stack,
            inputTokens,
            inputIndex,
            `ERRO: Entrada '${currentInput}' não encontrada na tabela para ${top}`
          );
          return {
            accepted: false,
            trace: this.trace,
            steps: this.stepCount,
            error: `Erro na posição ${inputIndex}: não há produção para ${top} com entrada '${currentInput}'`,
          };
        }

        stack.pop();

        if (production[0] !== "ε") {
          for (let i = production.length - 1; i >= 0; i--) {
            stack.push(production[i]);
          }
        }

        const productionStr = production.join(" ") || "ε";
        this.addTraceStep(
          stack,
          inputTokens,
          inputIndex,
          `Aplicar: ${top} -> ${productionStr}`
        );
      } else {
        this.addTraceStep(
          stack,
          inputTokens,
          inputIndex,
          `ERRO: Símbolo desconhecido '${top}'`
        );
        return {
          accepted: false,
          trace: this.trace,
          steps: this.stepCount,
          error: `Símbolo desconhecido: ${top}`,
        };
      }
    }

    return {
      accepted: false,
      trace: this.trace,
      steps: this.stepCount,
      error: "Pilha vazia antes do fim da entrada",
    };
  }

  addTraceStep(stack, input, inputIndex, action) {
    const stackCopy = [...stack].revers;
    const remainingInput = input.slice(inputIndex).join("");

    this.trace.push({
      step: this.stepCount,
      stack: stackCopy.join(" "),
      input: remainingInput,
      action: action,
    });
  }

  generateSentence() {
    return this.generateFromSymbol(startSymbol);
  }

  generateFromSymbol(symbol, depth = 0, maxDepth = 20) {
    if (depth > maxDepth) {
      if (symbol === "A") return "";
      if (symbol === "B") {
        const productions = grammar[symbol];
        return "d";
      }
      if (symbol === "D") {
        return "d";
      }
      return "";
    }

    if (isTerminal(symbol)) {
      return symbol === "ε" ? "" : symbol;
    }

    if (isNonTerminal(symbol)) {
      const productions = grammar[symbol];
      const randomProduction =
        productions[Math.floor(Math.random() * productions.length)];

      let result = "";
      for (const sym of randomProduction) {
        result += this.generateFromSymbol(sym, depth + 1, maxDepth);
      }
      return result;
    }

    return "";
  }

  generateInteractive() {
    const steps = [];
    let currentSentence = "";
    let currentSymbol = startSymbol;
    const derivation = [startSymbol];
    let depth = 0;
    const maxDepth = 20;

    const generateStep = (symbol) => {
      if (depth > maxDepth) {
        if (symbol === "A") {
          const symbolIndex = derivation.indexOf(symbol);
          if (symbolIndex !== -1) {
            derivation.splice(symbolIndex, 1);
            steps.push({
              step: steps.length + 1,
              derivation: derivation.join(" ") || "ε",
              production: `${symbol} -> ε`,
            });
          }
        }
        return;
      }

      if (isTerminal(symbol)) {
        if (symbol !== "ε") {
          currentSentence += symbol;
        }
        return;
      }

      if (isNonTerminal(symbol)) {
        depth++;
        const productions = grammar[symbol];
        const randomIndex = Math.floor(Math.random() * productions.length);
        const production = productions[randomIndex];

        const symbolIndex = derivation.indexOf(symbol);
        if (symbolIndex !== -1) {
          derivation.splice(symbolIndex, 1, ...production);
          steps.push({
            step: steps.length + 1,
            derivation: derivation.join(" ") || "ε",
            production: `${symbol} -> ${production.join(" ") || "ε"}`,
          });
        }

        for (const sym of production) {
          generateStep(sym);
        }
        depth--;
      }
    };

    generateStep(currentSymbol);

    return {
      sentence: currentSentence,
      steps: steps,
    };
  }
}
