/**
 * Funções de cálculo da calculadora de negociação de dívidas.
 * Ficam separadas da interface (app.js) para poderem ser testadas sozinhas.
 */

/** Arredonda para 2 casas decimais (centavos). */
function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

/**
 * Valor a pagar à vista com desconto.
 * @param {number} divida  valor total da dívida em R$
 * @param {number} descontoPercentual  ex.: 60 para 60%
 */
function calcularAVista(divida, descontoPercentual) {
  if (divida <= 0) throw new Error("A dívida precisa ser maior que zero.");
  if (descontoPercentual < 0 || descontoPercentual > 100) {
    throw new Error("O desconto precisa estar entre 0 e 100%.");
  }
  const valorFinal = divida * (1 - descontoPercentual / 100);
  return {
    valorFinal: arredondar(valorFinal),
    economia: arredondar(divida - valorFinal),
  };
}

/**
 * Valor da parcela pela Tabela Price (parcelas iguais com juros compostos).
 * Fórmula: PMT = PV * i / (1 - (1 + i)^-n)
 * @param {number} valorFinanciado  valor que será parcelado
 * @param {number} jurosMensalPercentual  ex.: 1.99 para 1,99% ao mês
 * @param {number} numeroParcelas
 */
function calcularParcela(valorFinanciado, jurosMensalPercentual, numeroParcelas) {
  if (numeroParcelas < 1) throw new Error("Informe pelo menos 1 parcela.");
  const i = jurosMensalPercentual / 100;
  if (i === 0) return arredondar(valorFinanciado / numeroParcelas);
  const parcela = (valorFinanciado * i) / (1 - Math.pow(1 + i, -numeroParcelas));
  return arredondar(parcela);
}

/**
 * Simula um acordo parcelado: desconto sobre a dívida, entrada e parcelas.
 */
function simularParcelado({ divida, descontoPercentual, entrada, jurosMensalPercentual, numeroParcelas }) {
  const { valorFinal: valorAcordo } = calcularAVista(divida, descontoPercentual);
  if (entrada < 0 || entrada > valorAcordo) {
    throw new Error("A entrada precisa estar entre zero e o valor do acordo.");
  }
  const valorFinanciado = valorAcordo - entrada;
  const parcela = calcularParcela(valorFinanciado, jurosMensalPercentual, numeroParcelas);
  const totalPago = arredondar(entrada + parcela * numeroParcelas);
  return {
    valorAcordo,
    valorFinanciado: arredondar(valorFinanciado),
    parcela,
    totalPago,
    jurosPagos: arredondar(totalPago - valorAcordo),
    economia: arredondar(divida - totalPago),
  };
}

/**
 * Tabela de amortização (Price): mostra mês a mês quanto é juros e quanto abate do saldo.
 */
function tabelaAmortizacao(valorFinanciado, jurosMensalPercentual, numeroParcelas) {
  const i = jurosMensalPercentual / 100;
  const parcela = calcularParcela(valorFinanciado, jurosMensalPercentual, numeroParcelas);
  const linhas = [];
  let saldo = valorFinanciado;
  for (let mes = 1; mes <= numeroParcelas; mes++) {
    const juros = saldo * i;
    let amortizacao = parcela - juros;
    if (mes === numeroParcelas) amortizacao = saldo; // última parcela zera o saldo
    saldo -= amortizacao;
    linhas.push({
      mes,
      parcela: arredondar(juros + amortizacao),
      juros: arredondar(juros),
      amortizacao: arredondar(amortizacao),
      saldo: arredondar(Math.max(saldo, 0)),
    });
  }
  return linhas;
}

/** Diz qual opção sai mais barata no total. */
function compararOpcoes(totalAVista, totalParcelado) {
  const diferenca = arredondar(Math.abs(totalParcelado - totalAVista));
  if (totalAVista < totalParcelado) return { melhor: "à vista", diferenca };
  if (totalParcelado < totalAVista) return { melhor: "parcelado", diferenca };
  return { melhor: "empate", diferenca: 0 };
}

// Permite usar as funções nos testes com Node.js
if (typeof module !== "undefined") {
  module.exports = { arredondar, calcularAVista, calcularParcela, simularParcelado, tabelaAmortizacao, compararOpcoes };
}
