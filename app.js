// Liga o formulário da página às funções de calculos.js

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function lerNumero(id) {
  const valor = document.getElementById(id).value.replace(",", ".");
  return Number(valor) || 0;
}

function mostrarErro(mensagem) {
  const erro = document.getElementById("erro");
  erro.textContent = mensagem;
  erro.hidden = !mensagem;
}

function simular(evento) {
  evento.preventDefault();
  mostrarErro("");

  const divida = lerNumero("divida");
  const descontoAVista = lerNumero("descontoAVista");
  const dadosParcelado = {
    divida,
    descontoPercentual: lerNumero("descontoParcelado"),
    entrada: lerNumero("entrada"),
    jurosMensalPercentual: lerNumero("juros"),
    numeroParcelas: Math.round(lerNumero("parcelas")),
  };

  try {
    const aVista = calcularAVista(divida, descontoAVista);
    const parcelado = simularParcelado(dadosParcelado);
    const comparacao = compararOpcoes(aVista.valorFinal, parcelado.totalPago);

    document.getElementById("avistaValor").textContent = moeda.format(aVista.valorFinal);
    document.getElementById("avistaEconomia").textContent = moeda.format(aVista.economia);

    document.getElementById("parcValor").textContent =
      `${moeda.format(dadosParcelado.entrada)} + ${dadosParcelado.numeroParcelas}x ${moeda.format(parcelado.parcela)}`;
    document.getElementById("parcTotal").textContent = moeda.format(parcelado.totalPago);
    document.getElementById("parcJuros").textContent = moeda.format(parcelado.jurosPagos);
    document.getElementById("parcEconomia").textContent = moeda.format(parcelado.economia);

    const veredito = document.getElementById("veredito");
    veredito.textContent =
      comparacao.melhor === "empate"
        ? "As duas opções custam o mesmo no total."
        : `Pagar ${comparacao.melhor} sai ${moeda.format(comparacao.diferenca)} mais barato no total.`;

    montarTabela(parcelado.valorFinanciado, dadosParcelado.jurosMensalPercentual, dadosParcelado.numeroParcelas);
    document.getElementById("resultado").hidden = false;
  } catch (e) {
    document.getElementById("resultado").hidden = true;
    mostrarErro(e.message);
  }
}

function montarTabela(valorFinanciado, juros, parcelas) {
  const corpo = document.getElementById("tabelaCorpo");
  corpo.innerHTML = "";
  for (const linha of tabelaAmortizacao(valorFinanciado, juros, parcelas)) {
    const tr = document.createElement("tr");
    const celulas = [
      linha.mes,
      moeda.format(linha.parcela),
      moeda.format(linha.juros),
      moeda.format(linha.amortizacao),
      moeda.format(linha.saldo),
    ];
    for (const texto of celulas) {
      const td = document.createElement("td");
      td.textContent = texto;
      tr.appendChild(td);
    }
    corpo.appendChild(tr);
  }
}

document.getElementById("formulario").addEventListener("submit", simular);
