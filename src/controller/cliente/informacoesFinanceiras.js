const Database = require("../../database/connection");

const __sqlDadosCliente = (codCli) => `SELECT pcclient.CODCLI,
PCCLIENT.CLIENTE,
PCCLIENT.FANTASIA,
PCCLIENT.CODUSUR1 AS RCA,
PCCLIENT.LIMCRED AS LIMITE,
PCCLIENT.CGCENT AS CPFCNPJ,
PCPLPAG.DESCRICAO AS PLANO_PAG,

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
AND pcpedc.codcli = ${codCli}) AS COMPRA_MAX,

(SELECT MIN(DATA)
FROM pcpedc
WHERE PCPEDC.POSICAO = 'F'
AND pcpedc.codcli = ${codCli}) AS DATA_PRIMEIRA_COMPRA,

(SELECT MAX(DATA)
FROM pcpedc
WHERE PCPEDC.POSICAO = 'F'
AND pcpedc.codcli = ${codCli}) AS DATA_ULTIMA_COMPRA

FROM PCCLIENT,
PCPLPAG
WHERE PCPLPAG.CODPLPAG = PCCLIENT.CODPLPAG
AND PCCLIENT.CODCLI = ${codCli};`;

const __sqlBoletosCliente = (codCli) => `
SELECT PCPREST.CODCOB,
       PCPREST.DTVENC,
       PCPREST.VALOR AS VL_BOLETO,
       TRUNC(SYSDATE) - PCPREST.DTVENC AS DIAS_ATRASO
FROM PCPREST
WHERE PCPREST.dtpag IS NULL
  AND PCPREST.DTVENC < TRUNC(SYSDATE)
  AND PCPREST.CODCOB IN ('06',
                         '31',
                         '36')
  AND PCPREST.CODCLI = ${codCli}`;

const index = async (req, res) => {
  const { codCli } = req.params;
  const sqlDadosCliente = __sqlDadosCliente(codCli);
  const sqlBoletosCliente = __sqlBoletosCliente(codCli);

  try {
    const resDadosCliente = await Database.querySelection(sqlDadosCliente);
    const dadosCliente = resDadosCliente[0];

    const resBoletosCliente = await Database.querySelection(sqlBoletosCliente);
    const boletosCliente = resBoletosCliente;

    const dataResponse = {};

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

    const saldoAtual =
      (dadosCliente.LIMITE || 0) -
      (dadosCliente.VL_RECEBER || 0) -
      (dadosCliente.PED_FATURAR || 0);

    dataResponse.valores = {
      limite: dadosCliente.LIMITE,
      vlReceber: dadosCliente.VL_RECEBER,
      pedFaturar: dadosCliente.PED_FATURAR,
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
