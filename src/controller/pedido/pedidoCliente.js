const Database = require("../../database/connection");

const __sqlCliente = (codCli) => `SELECT cliente, fantasia, tipofj, cgcent
FROM pcclient
WHERE codcli = ${codCli}`;

const __sqlPedidoCabecalho = (numPed) => `SELECT pcpedc.posicao,
pcpedc.codCli,
pcpedc.codfilial,
pcpedc.codcob,
pccob.cobranca,
pcpedc.codusur as COD_RCA,
pcusuari.nome as NOME_RCA,
pccarreg.CODMOTORISTA AS COD_TRANSPORTADORA,
(SELECT nome
FROM pcempr
WHERE pcempr.MATRICULA = pccarreg.CODMOTORISTA) AS TRANSPORTADORA,
pcpedc.VLFRETE AS FRETE,
pcpedc.NUMVOLUME AS QTD_VOLUMES,
pcplpag.descricao AS PL_PAG_PED,
pcplpag.NUMPR AS COD_TBL_PRECOS,
round(pcpedc.totpeso, 2) AS PESO_BRUTO,
to_char(pcpedc.data, 'DD/MM/YYYY') AS DATA,
pcpedc.numregiao
FROM pcpedc,
pcplpag,
pcusuari,
pccob,
pccarreg
WHERE pccarreg.NUMCAR = pcpedc.NUMCAR
AND pcpedc.codcob = pccob.codcob
AND pcpedc.codplpag = pcplpag.codplpag
AND pcusuari.codusur = pcpedc.codusur
AND pcpedc.numped = ${numPed};`;

const __sqlPedidoItens = (numPed) => `SELECT pcpedi.codprod,
pcprodut.descricao,
(pcest.qtest - pcest.qtbloqueada) AS qt_est,
pcpedi.qt AS qt_prod_ped,
round(pcpedi.ptabela, 2) AS preco_unit,
round(pcpedi.pvenda, 2) AS preco_unit_desc,
round(pcpedi.perdesc, 0) AS desconto,
round(pcprodut.pesobruto, 2) AS PESO_BRUTO,
round(pcprodut.pesoliq, 2) AS PESO_LIQUIDO
FROM pcpedi,
pcprodut,
pcest,
pcpedc
WHERE pcpedi.codprod = pcprodut.codprod
AND pcpedi.codprod = pcest.codprod
AND pcest.codfilial = pcpedc.codfilial
AND pcpedi.numped = pcpedc.numped
AND pcpedi.numped = ${numPed}
ORDER BY pcprodut.descricao;`;

const index = async (req, res) => {
  const { numPed } = req.params;

  if (!numPed) {
    return res.sendStatus(400).json();
  }

  const sqlPedidoCabecalho = __sqlPedidoCabecalho(numPed);
  const sqlPedidoItens = __sqlPedidoItens(numPed);

  try {
    const dataResponse = {};

    const resPedidoCabecalho = await Database.querySelection(
      sqlPedidoCabecalho
    );
    const dadosPedidoCabecalho = resPedidoCabecalho[0];

    if (!dadosPedidoCabecalho) {
      return res.sendStatus(404);
    }

    dataResponse.pedidoCabecalho = {
      numPed,
      posicao: dadosPedidoCabecalho.POSICAO,
      codFilial: dadosPedidoCabecalho.CODFILIAL,
      codCob: dadosPedidoCabecalho.CODCOB,
      cobranca: dadosPedidoCabecalho.COBRANCA,
      codTransportadora: dadosPedidoCabecalho.COD_TRANSPORTADORA,
      transportadora: dadosPedidoCabecalho.TRANSPORTADORA,
      frete: dadosPedidoCabecalho.FRETE,
      qtdVolume: dadosPedidoCabecalho.QTD_VOLUMES,
      planoPag: dadosPedidoCabecalho.PL_PAG_PED,
      codTabelaPrecos: dadosPedidoCabecalho.COD_TBL_PRECOS,
      pesoBruto: dadosPedidoCabecalho.PESO_BRUTO,
      data: dadosPedidoCabecalho.DATA,
      numRegiao: dadosPedidoCabecalho.NUMREGIAO,
      codRca: dadosPedidoCabecalho.COD_RCA,
      nomeRca: dadosPedidoCabecalho.NOME_RCA,
    };

    const resPedidoItens = await Database.querySelection(sqlPedidoItens);

    dataResponse.produtos = [];
    for (let produto of resPedidoItens) {
      dataResponse.produtos.push({
        codProd: produto.CODPROD,
        descricao: produto.DESCRICAO,
        qtEstoque: produto.QT_EST,
        qtPedido: produto.QT_PROD_PED,
        precoUnit: produto.PRECO_UNIT,
        precoUnitDesc: produto.PRECO_UNIT_DESC,
        desconto: produto.DESCONTO,
        pesoBruto: produto.PESO_BRUTO,
        pesoLiquido: produto.PESO_LIQUIDO,
      });
    }

    const codCli = dadosPedidoCabecalho.CODCLI;

    const sqlCliente = __sqlCliente(codCli);
    const resCliente = await Database.querySelection(sqlCliente);
    const dadosCliente = resCliente[0];

    dataResponse.cliente = {
      codCli,
      nome: dadosCliente.CLIENTE,
      fantasia: dadosCliente.FANTASIA,
      tipoCliente: dadosCliente.TIPOFJ,
      cpfCnpj: dadosCliente.CGCENT,
    };

    return res.json(dataResponse);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

module.exports = index;
