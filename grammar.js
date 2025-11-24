// Gramática Livre de Contexto LL(1)
// Regras: S, A, B, C, D
// Alfabeto: a, b, c, d

const grammar = {
    // S -> A B
    'S': [['A', 'B']],
    
    // A -> a A | b C | ε (3 produções, uma com ε)
    'A': [['a', 'A'], ['b', 'C'], ['ε']],
    
    // B -> c B | d A (2 produções, permite terminação via A -> ε)
    'B': [['c', 'B'], ['d', 'A']],
    
    // C -> a D | b D (2 produções)
    'C': [['a', 'D'], ['b', 'D']],
    
    // D -> c D | d A (2 produções, permite terminação via A -> ε)
    'D': [['c', 'D'], ['d', 'A']]
};

// Símbolos terminais
const terminals = ['a', 'b', 'c', 'd', '$'];

// Símbolos não-terminais
const nonTerminals = ['S', 'A', 'B', 'C', 'D'];

// Símbolo inicial
const startSymbol = 'S';

// Verifica se um símbolo é terminal
function isTerminal(symbol) {
    return terminals.includes(symbol) || (symbol !== 'ε' && !nonTerminals.includes(symbol));
}

// Verifica se um símbolo é não-terminal
function isNonTerminal(symbol) {
    return nonTerminals.includes(symbol);
}

// Calcula FIRST de um símbolo ou string de símbolos
function calculateFirst(symbol) {
    const firstSet = new Set();
    
    // Se é terminal ou ε
    if (isTerminal(symbol)) {
        if (symbol === 'ε') {
            firstSet.add('ε');
        } else {
            firstSet.add(symbol);
        }
        return firstSet;
    }
    
    // Se é não-terminal
    if (isNonTerminal(symbol)) {
        const productions = grammar[symbol];
        
        for (const production of productions) {
            if (production.length === 0 || production[0] === 'ε') {
                firstSet.add('ε');
            } else {
                let allHaveEpsilon = true;
                
                for (const sym of production) {
                    const firstOfSym = calculateFirst(sym);
                    const hasEpsilon = firstOfSym.has('ε');
                    
                    for (const f of firstOfSym) {
                        if (f !== 'ε') {
                            firstSet.add(f);
                        }
                    }
                    
                    if (!hasEpsilon) {
                        allHaveEpsilon = false;
                        break;
                    }
                }
                
                if (allHaveEpsilon) {
                    firstSet.add('ε');
                }
            }
        }
    }
    
    return firstSet;
}

// Calcula FIRST de uma string de símbolos (produção)
function calculateFirstOfString(symbols) {
    const firstSet = new Set();
    
    if (symbols.length === 0 || symbols[0] === 'ε') {
        firstSet.add('ε');
        return firstSet;
    }
    
    let allHaveEpsilon = true;
    
    for (const symbol of symbols) {
        const firstOfSym = calculateFirst(symbol);
        const hasEpsilon = firstOfSym.has('ε');
        
        for (const f of firstOfSym) {
            if (f !== 'ε') {
                firstSet.add(f);
            }
        }
        
        if (!hasEpsilon) {
            allHaveEpsilon = false;
            break;
        }
    }
    
    if (allHaveEpsilon) {
        firstSet.add('ε');
    }
    
    return firstSet;
}

// Calcula FOLLOW de um não-terminal (com cache para evitar recursão infinita)
const followCache = {};

function calculateFollow(nonTerminal, visited = new Set()) {
    // Se já foi calculado, retorna do cache
    if (followCache[nonTerminal]) {
        return followCache[nonTerminal];
    }
    
    // Evita recursão infinita
    if (visited.has(nonTerminal)) {
        return new Set();
    }
    
    visited.add(nonTerminal);
    const followSet = new Set();
    
    // FOLLOW do símbolo inicial contém $
    if (nonTerminal === startSymbol) {
        followSet.add('$');
    }
    
    // Para cada regra A -> α B β
    for (const [A, productions] of Object.entries(grammar)) {
        for (const production of productions) {
            for (let i = 0; i < production.length; i++) {
                if (production[i] === nonTerminal) {
                    // β é o restante da produção após B
                    const beta = production.slice(i + 1);
                    
                    if (beta.length > 0) {
                        // Adiciona FIRST(β) - {ε} a FOLLOW(B)
                        const firstBeta = calculateFirstOfString(beta);
                        for (const f of firstBeta) {
                            if (f !== 'ε') {
                                followSet.add(f);
                            }
                        }
                        
                        // Se ε está em FIRST(β), adiciona FOLLOW(A) a FOLLOW(B)
                        if (firstBeta.has('ε')) {
                            if (A !== nonTerminal) {
                                const followA = calculateFollow(A, new Set(visited));
                                for (const f of followA) {
                                    followSet.add(f);
                                }
                            }
                        }
                    } else {
                        // B está no final, adiciona FOLLOW(A) a FOLLOW(B)
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
    
    // Armazena no cache
    followCache[nonTerminal] = followSet;
    return followSet;
}

// Calcula todos os conjuntos FIRST
function getAllFirstSets() {
    const firstSets = {};
    
    for (const nt of nonTerminals) {
        firstSets[nt] = calculateFirst(nt);
    }
    
    return firstSets;
}

// Calcula todos os conjuntos FOLLOW
function getAllFollowSets() {
    // Limpa o cache antes de recalcular
    Object.keys(followCache).forEach(key => delete followCache[key]);
    
    const followSets = {};
    
    for (const nt of nonTerminals) {
        followSets[nt] = calculateFollow(nt);
    }
    
    return followSets;
}

// Cria a tabela de parsing LL(1)
function createParsingTable() {
    const firstSets = getAllFirstSets();
    const followSets = getAllFollowSets();
    const table = {};
    
    // Inicializa a tabela
    for (const nt of nonTerminals) {
        table[nt] = {};
        for (const t of terminals) {
            table[nt][t] = null;
        }
    }
    
    // Preenche a tabela
    for (const [A, productions] of Object.entries(grammar)) {
        for (const production of productions) {
            const firstAlpha = calculateFirstOfString(production);
            
            // Para cada terminal a em FIRST(α)
            for (const a of firstAlpha) {
                if (a !== 'ε' && terminals.includes(a)) {
                    table[A][a] = production;
                }
            }
            
            // Se ε está em FIRST(α)
            if (firstAlpha.has('ε')) {
                // Para cada terminal b em FOLLOW(A)
                for (const b of followSets[A]) {
                    if (b === '$') {
                        table[A]['$'] = production;
                    } else if (terminals.includes(b)) {
                        table[A][b] = production;
                    }
                }
            }
        }
    }
    
    return table;
}

