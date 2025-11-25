const grammar = {
  S: [["A", "B"]],
  A: [["a", "A"], ["b", "C"], ["ε"]],
  B: [["c", "B"],["d", "A"],],
  C: [["a", "D"],["b", "D"],],
  D: [["c", "D"],["d", "A"],],
};

const terminals = ["a", "b", "c", "d", "$"];

const nonTerminals = ["S", "A", "B", "C", "D"];

const startSymbol = "S";

function isTerminal(symbol) {
  return (
    terminals.includes(symbol) ||
    (symbol !== "ε" && !nonTerminals.includes(symbol))
  );
}

function isNonTerminal(symbol) {
  return nonTerminals.includes(symbol);
}

function calculateFirst(symbol) {
  const firstSet = new Set();

  if (isTerminal(symbol)) {
    if (symbol === "ε") {
      firstSet.add("ε");
    } else {
      firstSet.add(symbol);
    }
    return firstSet;
  }

  if (isNonTerminal(symbol)) {
    const productions = grammar[symbol];

    for (const production of productions) {
      if (production.length === 0 || production[0] === "ε") {
        firstSet.add("ε");
      } else {
        let allHaveEpsilon = true;

        for (const sym of production) {
          const firstOfSym = calculateFirst(sym);
          const hasEpsilon = firstOfSym.has("ε");

          for (const f of firstOfSym) {
            if (f !== "ε") {
              firstSet.add(f);
            }
          }

          if (!hasEpsilon) {
            allHaveEpsilon = false;
            break;
          }
        }

        if (allHaveEpsilon) {
          firstSet.add("ε");
        }
      }
    }
  }

  return firstSet;
}

function calculateFirstOfString(symbols) {
  const firstSet = new Set();

  if (symbols.length === 0 || symbols[0] === "ε") {
    firstSet.add("ε");
    return firstSet;
  }

  let allHaveEpsilon = true;

  for (const symbol of symbols) {
    const firstOfSym = calculateFirst(symbol);
    const hasEpsilon = firstOfSym.has("ε");

    for (const f of firstOfSym) {
      if (f !== "ε") {
        firstSet.add(f);
      }
    }

    if (!hasEpsilon) {
      allHaveEpsilon = false;
      break;
    }
  }

  if (allHaveEpsilon) {
    firstSet.add("ε");
  }

  return firstSet;
}

const followCache = {};

function calculateFollow(nonTerminal, visited = new Set()) {
  if (followCache[nonTerminal]) {
    return followCache[nonTerminal];
  }

  if (visited.has(nonTerminal)) {
    return new Set();
  }

  visited.add(nonTerminal);
  const followSet = new Set();

  if (nonTerminal === startSymbol) {
    followSet.add("$");
  }

  for (const [A, productions] of Object.entries(grammar)) {
    for (const production of productions) {
      for (let i = 0; i < production.length; i++) {
        if (production[i] === nonTerminal) {
          const beta = production.slice(i + 1);

          if (beta.length > 0) {
            const firstBeta = calculateFirstOfString(beta);
            for (const f of firstBeta) {
              if (f !== "ε") {
                followSet.add(f);
              }
            }

            if (firstBeta.has("ε")) {
              if (A !== nonTerminal) {
                const followA = calculateFollow(A, new Set(visited));
                for (const f of followA) {
                  followSet.add(f);
                }
              }
            }
          } else {
            if (A !== nonTerminal) {
              const followA = calculateFollow(A, new Set(visited));
              for (const f of followA) {
                followSet.add(f);
              }
            }
          }
        }
      }
    }
  }

  followCache[nonTerminal] = followSet;
  return followSet;
}

function getAllFirstSets() {
  const firstSets = {};

  for (const nt of nonTerminals) {
    firstSets[nt] = calculateFirst(nt);
  }

  return firstSets;
}

function getAllFollowSets() {
  Object.keys(followCache).forEach((key) => delete followCache[key]);

  const followSets = {};

  for (const nt of nonTerminals) {
    followSets[nt] = calculateFollow(nt);
  }

  return followSets;
}

function createParsingTable() {
  const firstSets = getAllFirstSets();
  const followSets = getAllFollowSets();
  const table = {};

  for (const nt of nonTerminals) {
    table[nt] = {};
    for (const t of terminals) {
      table[nt][t] = null;
    }
  }

  for (const [A, productions] of Object.entries(grammar)) {
    for (const production of productions) {
      const firstAlpha = calculateFirstOfString(production);

      for (const a of firstAlpha) {
        if (a !== "ε" && terminals.includes(a)) {
          table[A][a] = production;
        }
      }

      if (firstAlpha.has("ε")) {
        for (const b of followSets[A]) {
          if (b === "$") {
            table[A]["$"] = production;
          } else if (terminals.includes(b)) {
            table[A][b] = production;
          }
        }
      }
    }
  }

  return table;
}
