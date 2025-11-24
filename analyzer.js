// Analisador Sintático Top-Down Preditivo Tabular

class PredictiveParser {
    constructor() {
        this.parsingTable = createParsingTable();
        this.trace = [];
        this.stepCount = 0;
    }

    // Analisa uma sentença de entrada
    analyze(input) {
        this.trace = [];
        this.stepCount = 0;
        
        // Adiciona $ ao final da entrada
        const inputTokens = input.split('').filter(c => c.trim() !== '');
        inputTokens.push('$');
        
        // Inicializa a pilha com $ e o símbolo inicial
        const stack = ['$', startSymbol];
        let inputIndex = 0;
        
        // Estado inicial
        this.addTraceStep(stack, inputTokens, inputIndex, 'Inicialização');
        
        while (stack.length > 0) {
            this.stepCount++;
            const top = stack[stack.length - 1];
            const currentInput = inputTokens[inputIndex];
            
            // Se o topo da pilha é terminal
            if (isTerminal(top)) {
                if (top === currentInput) {
                    // Match
                    if (top === '$') {
                        this.addTraceStep(stack, inputTokens, inputIndex, 'Aceito!');
                        return { accepted: true, trace: this.trace, steps: this.stepCount };
                    }
                    stack.pop();
                    inputIndex++;
                    this.addTraceStep(stack, inputTokens, inputIndex, `Match: ${top}`);
                } else {
                    // Erro: terminal não corresponde
                    this.addTraceStep(stack, inputTokens, inputIndex, 
                        `ERRO: Esperado ${top}, encontrado ${currentInput}`);
                    return { accepted: false, trace: this.trace, steps: this.stepCount, 
                        error: `Erro na posição ${inputIndex}: esperado '${top}', encontrado '${currentInput}'` };
                }
            } 
            // Se o topo da pilha é não-terminal
            else if (isNonTerminal(top)) {
                const production = this.parsingTable[top][currentInput];
                
                if (production === null || production === undefined) {
                    // Erro: entrada não está na tabela
                    this.addTraceStep(stack, inputTokens, inputIndex, 
                        `ERRO: Entrada '${currentInput}' não encontrada na tabela para ${top}`);
                    return { accepted: false, trace: this.trace, steps: this.stepCount,
                        error: `Erro na posição ${inputIndex}: não há produção para ${top} com entrada '${currentInput}'` };
                }
                
                stack.pop();
                
                // Adiciona a produção à pilha (da direita para a esquerda)
                if (production[0] !== 'ε') {
                    for (let i = production.length - 1; i >= 0; i--) {
                        stack.push(production[i]);
                    }
                }
                
                const productionStr = production.join(' ') || 'ε';
                this.addTraceStep(stack, inputTokens, inputIndex, 
                    `Aplicar: ${top} -> ${productionStr}`);
            } else {
                // Erro: símbolo desconhecido
                this.addTraceStep(stack, inputTokens, inputIndex, 
                    `ERRO: Símbolo desconhecido '${top}'`);
                return { accepted: false, trace: this.trace, steps: this.stepCount,
                    error: `Símbolo desconhecido: ${top}` };
            }
        }
        
        return { accepted: false, trace: this.trace, steps: this.stepCount, error: 'Pilha vazia antes do fim da entrada' };
    }

    // Adiciona um passo ao traço
    addTraceStep(stack, input, inputIndex, action) {
        const stackCopy = [...stack].reverse(); // Inverte para mostrar do topo para a base
        const remainingInput = input.slice(inputIndex).join('');
        
        this.trace.push({
            step: this.stepCount,
            stack: stackCopy.join(' '),
            input: remainingInput,
            action: action
        });
    }

    // Gera uma sentença válida de forma interativa
    generateSentence() {
        return this.generateFromSymbol(startSymbol);
    }

    // Gera uma sentença a partir de um símbolo (com limite de profundidade)
    generateFromSymbol(symbol, depth = 0, maxDepth = 20) {
        if (depth > maxDepth) {
            // Força terminação escolhendo produção que leva a ε ou terminal
            if (symbol === 'A') return '';
            if (symbol === 'B') {
                const productions = grammar[symbol];
                // Prefere produção que não seja puramente recursiva
                return 'd';
            }
            if (symbol === 'D') {
                return 'd';
            }
            return '';
        }
        
        if (isTerminal(symbol)) {
            return symbol === 'ε' ? '' : symbol;
        }
        
        if (isNonTerminal(symbol)) {
            const productions = grammar[symbol];
            // Escolhe uma produção aleatória
            const randomProduction = productions[Math.floor(Math.random() * productions.length)];
            
            let result = '';
            for (const sym of randomProduction) {
                result += this.generateFromSymbol(sym, depth + 1, maxDepth);
            }
            return result;
        }
        
        return '';
    }

    // Gera sentença passo a passo (interativo)
    generateInteractive() {
        const steps = [];
        let currentSentence = '';
        let currentSymbol = startSymbol;
        const derivation = [startSymbol];
        let depth = 0;
        const maxDepth = 20;
        
        const generateStep = (symbol) => {
            if (depth > maxDepth) {
                // Força terminação
                if (symbol === 'A') {
                    const symbolIndex = derivation.indexOf(symbol);
                    if (symbolIndex !== -1) {
                        derivation.splice(symbolIndex, 1);
                        steps.push({
                            step: steps.length + 1,
                            derivation: derivation.join(' ') || 'ε',
                            production: `${symbol} -> ε`
                        });
                    }
                }
                return;
            }
            
            if (isTerminal(symbol)) {
                if (symbol !== 'ε') {
                    currentSentence += symbol;
                }
                return;
            }
            
            if (isNonTerminal(symbol)) {
                depth++;
                const productions = grammar[symbol];
                // Escolhe uma produção aleatória
                const randomIndex = Math.floor(Math.random() * productions.length);
                const production = productions[randomIndex];
                
                // Substitui o símbolo na derivação
                const symbolIndex = derivation.indexOf(symbol);
                if (symbolIndex !== -1) {
                    derivation.splice(symbolIndex, 1, ...production);
                    steps.push({
                        step: steps.length + 1,
                        derivation: derivation.join(' ') || 'ε',
                        production: `${symbol} -> ${production.join(' ') || 'ε'}`
                    });
                }
                
                // Processa cada símbolo da produção
                for (const sym of production) {
                    generateStep(sym);
                }
                depth--;
            }
        };
        
        generateStep(currentSymbol);
        
        return {
            sentence: currentSentence,
            steps: steps
        };
    }
}

