const Database = require("../../database/connection");

const __sqlDadosCliente = (numPed) => `SELECT PCCLIENT.CODCLI,
PCCLIENT.CLIENTE,
PCCLIENT.FANTASIA,
PCCLIENT.CODUSUR1 AS RCA,
PCCLIENT.LIMCRED AS LIMITE,
PCCLIENT.CGCENT AS CPFCNPJ,
PCPLPAG.DESCRICAO AS PLANO_PAG,
PCPEDC.CODUSUR AS COD_RCA,
PCUSUARI.NOME AS NOME_RCA,

(SELECT SUM(VALOR) AS TOTAL
FROM PCPREST
WHERE CODCLI = PCCLIENT.CODCLI
AND DTPAG IS NULL
AND CODCOB IN ('06',
             '31',
             '36')) AS VL_RECEBER,

(SELECT SUM(NVL(VLATEND, 0)) AS TOTAL
FROM PCPEDC
WHERE CODCLI = PCCLIENT.CODCLI
AND POSICAO IN ('L',
              'M',
              'B',
              'P')
AND DTCANCEL IS NULL) AS PED_FATURAR,

(SELECT MAX(VLTOTAL)
FROM pcpedc
WHERE PCPEDC.POSICAO = 'F'
AND pcpedc.codcli = pcclient.codcli) AS COMPRA_MAX,

(SELECT MIN(DATA)
FROM pcpedc
WHERE PCPEDC.POSICAO = 'F'
AND pcpedc.codcli = pcclient.codcli) AS DATA_PRIMEIRA_COMPRA,

(SELECT MAX(DATA)
FROM pcpedc
WHERE PCPEDC.POSICAO = 'F'
AND pcpedc.codcli = pcclient.codcli) AS DATA_ULTIMA_COMPRA
FROM PCCLIENT,
PCPLPAG,
PCPEDC,
PCUSUARI
WHERE PCPLPAG.CODPLPAG = PCCLIENT.CODPLPAG
AND PCCLIENT.CODCLI = PCCLIENT.codcli
AND PCCLIENT.CODCLI = PCPEDC.CODCLI
AND pcusuari.codusur = pcpedc.codusur
AND PCPEDC.NUMPED = ${numPed};`;

const __sqlBoletosCliente = (numPed) => `SELECT PCPREST.CODCOB,
PCPREST.DTVENC,
PCPREST.VALOR AS VL_BOLETO,
TRUNC(SYSDATE) - PCPREST.DTVENC AS DIAS_ATRASO
FROM PCPREST,
PCCLIENT,
PCPEDC
WHERE PCPREST.dtpag IS NULL
AND PCPREST.DTVENC < TRUNC(SYSDATE)
AND PCPREST.CODCOB IN ('06',
                  '31',
                  '36')
AND PCPREST.CODCLI = PCPEDC.CODCLI
AND PCCLIENT.CODCLI = PCPEDC.CODCLI
AND PCPEDC.NUMPED = ${numPed}`;

function converterParaNumeroOuZero(valor) {
  const numeroConvertido = parseFloat(valor);
  return !isNaN(numeroConvertido) && isFinite(numeroConvertido)
    ? numeroConvertido
    : 0;
}

const index = async (req, res) => {
  const { numPed } = req.params;
  const sqlDadosCliente = __sqlDadosCliente(numPed);
  const sqlBoletosCliente = __sqlBoletosCliente(numPed);

  try {
    const resDadosCliente = await Database.querySelection(sqlDadosCliente);
    const dadosCliente = resDadosCliente[0];

    const resBoletosCliente = await Database.querySelection(sqlBoletosCliente);
    const boletosCliente = resBoletosCliente;

    const dataResponse = {};

    dataResponse.pedido = {
      numPed: dadosCliente.NUMPED,
      codRca: dadosCliente.COD_RCA,
      nomeRca: dadosCliente.NOME_RCA,
    };

    dataResponse.cliente = {
      codCli: dadosCliente.CODCLI,
      cliente: dadosCliente.CLIENTE,
      fantasia: dadosCliente.FANTASIA,
      rca: dadosCliente.RCA,
      cpfcnpj: dadosCliente.CPFCNPJ,
      planoPag: dadosCliente.PLANO_PAG,
      compraMaxima: dadosCliente.COMPRA_MAX,
      dataPrimeiraCompra: dadosCliente.DATA_PRIMEIRA_COMPRA,
      dataUltimaCompra: dadosCliente.DATA_ULTIMA_COMPRA,
    };

    const limite = converterParaNumeroOuZero(dadosCliente.LIMITE);
    const vlReceber = converterParaNumeroOuZero(dadosCliente.VL_RECEBER);
    const pedFaturar = converterParaNumeroOuZero(dadosCliente.PED_FATURAR);
    const saldoAtual = limite - (vlReceber + pedFaturar);

    dataResponse.valores = {
      limite,
      vlReceber,
      pedFaturar,
      saldoAtual,
    };

    dataResponse.boletos = [];
    for (let boleto of boletosCliente) {
      dataResponse.boletos.push({
        codCob: boleto.CODCOB,
        dataVenc: boleto.DTVENC,
        valor: boleto.VL_BOLETO,
        diasAtraso: boleto.DIAS_ATRASO,
      });
    }

    return res.json(dataResponse);
  } catch (err) {
    console.log(err);
    res.status(500).send("");
  }
};

module.exports = index;
