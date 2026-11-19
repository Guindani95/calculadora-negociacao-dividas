// Testes automatizados. Rodar com: node --test
const test = require("node:test");
const assert = require("node:assert");
const c = require("./calculos.js");

test("à vista aplica o desconto corretamente", () => {
  const r = c.calcularAVista(10000, 70);
  assert.strictEqual(r.valorFinal, 3000);
  assert.strictEqual(r.economia, 7000);
});

test("à vista recusa desconto inválido", () => {
  assert.throws(() => c.calcularAVista(1000, 120));
  assert.throws(() => c.calcularAVista(0, 10));
});

test("parcela pela Tabela Price", () => {
  // R$ 1.000 em 12x a 1% ao mês = R$ 88,85 (valor conhecido de tabela)
  assert.strictEqual(c.calcularParcela(1000, 1, 12), 88.85);
});

test("parcela sem juros divide igualmente", () => {
  assert.strictEqual(c.calcularParcela(1200, 0, 12), 100);
});

test("simulação parcelada soma entrada e parcelas", () => {
  const r = c.simularParcelado({
    divida: 10000, descontoPercentual: 50, entrada: 500, jurosMensalPercentual: 0, numeroParcelas: 9,
  });
  assert.strictEqual(r.valorAcordo, 5000);
  assert.strictEqual(r.parcela, 500);
  assert.strictEqual(r.totalPago, 5000);
  assert.strictEqual(r.economia, 5000);
});

test("tabela de amortização zera o saldo no final", () => {
  const linhas = c.tabelaAmortizacao(1000, 1, 12);
  assert.strictEqual(linhas.length, 12);
  assert.strictEqual(linhas.at(-1).saldo, 0);
});

test("comparação aponta a opção mais barata", () => {
  assert.deepStrictEqual(c.compararOpcoes(3000, 5200), { melhor: "à vista", diferenca: 2200 });
  assert.deepStrictEqual(c.compararOpcoes(3000, 3000), { melhor: "empate", diferenca: 0 });
});
