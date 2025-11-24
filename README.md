# Analisador Sintático Top-Down Preditivo Tabular

Implementação de um Analisador Sintático Top-Down Preditivo Tabular (Autômato de Pilha) para a disciplina de Compiladores.

## Características

- **Gramática LL(1)** válida com 5 regras (S, A, B, C, D)
- Cálculo automático dos conjuntos **FIRST** e **FOLLOW**
- Geração automática da **Tabela de Parsing LL(1)**
- Análise de sentenças com traço completo da execução da pilha
- Geração interativa de sentenças válidas
- Interface moderna e responsiva

## Gramática

```
S -> A B
A -> a A | b C | ε
B -> c B | d A
C -> a D | b D
D -> c D | d A
```

### Características da Gramática:
- ✅ 5 regras: S, A, B, C, D
- ✅ Uma regra com 3 produções: A
- ✅ Três regras com no mínimo 2 produções: B, C, D
- ✅ Uma produção com ε: A -> ε
- ✅ Sem produções contendo um único terminal
- ✅ Fatorada e sem recursão à esquerda
- ✅ Não ambígua

## Como Usar

1. Abra o arquivo `index.html` em um navegador web moderno
2. A interface exibirá automaticamente:
   - A gramática
   - Os conjuntos FIRST e FOLLOW
   - A tabela de parsing
3. Para analisar uma sentença:
   - Digite uma sentença no campo de entrada
   - Clique em "Analisar" ou pressione Enter
   - Veja o resultado e o traço completo da execução
4. Para gerar uma sentença interativamente:
   - Clique em "Gerar Sentença Interativamente"
   - Veja os passos da derivação
   - A sentença gerada será analisada automaticamente

## Estrutura dos Arquivos

- `index.html` - Estrutura HTML da interface
- `style.css` - Estilos CSS para a interface
- `grammar.js` - Definição da gramática e cálculos de FIRST/FOLLOW
- `analyzer.js` - Implementação do analisador sintático
- `app.js` - Lógica da aplicação e interface

## Requisitos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Não requer instalação de dependências

## Execução Local

Para executar localmente, você pode usar um servidor HTTP simples:

```bash
# Python 3
python3 -m http.server 8000

# Node.js (com http-server instalado)
npx http-server

# PHP
php -S localhost:8000
```

Depois acesse `http://localhost:8000` no navegador.

## Funcionalidades Implementadas

- ✅ Exibição da gramática
- ✅ Cálculo e exibição dos conjuntos FIRST
- ✅ Cálculo e exibição dos conjuntos FOLLOW
- ✅ Geração e exibição da tabela de parsing
- ✅ Análise de sentenças com aceitação/rejeição
- ✅ Traço completo da execução da pilha (passo a passo)
- ✅ Contagem de passos da execução
- ✅ Geração interativa de sentenças
- ✅ Interface responsiva e moderna
- ✅ Reinicialização do analisador

