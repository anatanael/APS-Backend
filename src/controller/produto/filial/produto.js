const Database = require("../../../database/connection");

const __sqlProduto = (codFilial = false, numRegiao = false, condition) => {
  const codFilialPadrao = 1;

  const codFilialEscolhida = codFilial ? codFilial : codFilialPadrao;
  const numRegiaoEscolhida = numRegiao
    ? numRegiao
    : `(SELECT pcfilial.NUMREGIAOPADRAO
  FROM PCFILIAL
  WHERE codigo = ${codFilialEscolhida})`;

  return `SELECT pcprodut.codprod,
pcprodut.descricao,
(pcest.qtestger - pcest.qtbloqueada - pcest.qtreserv) AS ESTOQUE,
round(pcprodut.pesobruto, 2) AS PESO_BRUTO,
round(pcprodut.pesoliq, 2) AS PESO_LIQUIDO,
pctabpr.numregiao,
round(PCTABPR.pvenda1, 2) as PVENDA1,
round(PCTABPR.pvenda2, 2) as PVENDA2,
round(PCTABPR.pvenda3, 2) as PVENDA3,
round(PCTABPR.pvenda4, 2) as PVENDA4,
round(PCTABPR.pvenda5, 2) as PVENDA5,
round(PCTABPR.pvenda6, 2) as PVENDA6,
round(PCTABPR.pvenda7, 2) as PVENDA7,
(SELECT pctribut.PERACRESCISMOPF FROM pctribut where codst = pctabpr.codst) as PERACRESCISMOPF
FROM pcprodut,
pcest,
pctabpr
WHERE
${condition}
AND pctabpr.codprod = pcprodut.codprod
AND pcprodut.codprod = pcest.codprod
AND pcest.codprod = pcprodut.codprod
AND pcprodut.OBS2 != 'FL'
AND pctabpr.numRegiao = ${numRegiaoEscolhida}
AND pcest.codfilial = ${codFilialEscolhida}`;
};

const __sqlProdutoByCodigo = (codProd, codFilial, numRegiao) => {
  const condition = `pcprodut.codprod = ${codProd}`;
  return __sqlProduto(codFilial, numRegiao, condition);
};

const __sqlProdutoByDescricao = (descricao, codFilial, numRegiao) => {
  const condition = `pcprodut.descricao LIKE '${descricao}'`;
  return __sqlProduto(codFilial, numRegiao, condition);
};

const __sqlProdutoByCodBarra = (codBarra, codFilial, numRegiao) => {
  const condition = `pcprodut.codauxiliar = '${codBarra}'`;
  return __sqlProduto(codFilial, numRegiao, condition);
};

const __sqlProdutoMixCliente = (codCliente, codFilial, numRegiao) => {
  const condition = `pcprodut.codprod in 
  (select distinct codprod from pcpedi where codcli = ${codCliente} and pcpedi.DATA >= ADD_MONTHS(SYSDATE, -3))`;
  return __sqlProduto(codFilial, numRegiao, condition);
};

const formateArrayProdutos = (produtos) => {
  const produtosFormatado = [];

  for (let produto of produtos) {
    produtosFormatado.push({
      codProd: produto.CODPROD,
      descricao: produto.DESCRICAO,
      estoque: produto.ESTOQUE,
      pesoBruto: produto.PESO_BRUTO,
      pesoLiquido: produto.PESO_LIQUIDO,
      numRegiao: produto.NUMREGIAO,
      pvenda1: produto.PVENDA1,
      pvenda2: produto.PVENDA2,
      pvenda3: produto.PVENDA3,
      pvenda4: produto.PVENDA4,
      pvenda5: produto.PVENDA5,
      pvenda6: produto.PVENDA6,
      pvenda7: produto.PVENDA7,
      percentualAcrescimoPf: produto.PERACRESCISMOPF,
    });
  }

  return produtosFormatado;
};

const byDescricao = async (req, res) => {
  const { codFilial, descricaoProduto, numRegiao } = req.query;

  if (!descricaoProduto || !codFilial) {
    return res.sendStatus(400).json();
  }

  function formateDescricao(descricao) {
    let descricaoFormatted = descricao.toUpperCase();

    if (descricaoFormatted.charAt(0) !== "%") {
      descricaoFormatted = "%" + descricaoFormatted;
    }

    if (descricaoFormatted.charAt(descricaoFormatted.length - 1) !== "%") {
      descricaoFormatted += "%";
    }

    return descricaoFormatted;
  }

  const descricaoFormatada = formateDescricao(descricaoProduto);

  const sqlProdutoByDescricao = __sqlProdutoByDescricao(
    descricaoFormatada,
    codFilial,
    numRegiao
  );

  try {
    const resProdutoByDescricao = await Database.querySelection(
      sqlProdutoByDescricao
    );

    if (!resProdutoByDescricao) {
      return res.sendStatus(404);
    }

    const dataResponse = formateArrayProdutos(resProdutoByDescricao);

    return res.json(dataResponse);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

const byCodigo = async (req, res) => {
  const { codFilial, codProd, numRegiao } = req.query;

  if (!codProd || !codFilial) {
    return res.sendStatus(400).json();
  }

  const sqlProdutoByCodigo = __sqlProdutoByCodigo(
    codProd,
    codFilial,
    numRegiao
  );

  try {
    const resProdutoByCodigo = await Database.querySelection(
      sqlProdutoByCodigo
    );

    if (!resProdutoByCodigo) {
      return res.sendStatus(404);
    }

    const dataResponse = formateArrayProdutos(resProdutoByCodigo);

    return res.json(dataResponse);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

const byCodigoBarra = async (req, res) => {
  const { codFilial, codBarra, numRegiao } = req.query;

  if (!codBarra) {
    return res.sendStatus(400).json();
  }

  const sqlProdutoByCodBarra = __sqlProdutoByCodBarra(
    codBarra,
    codFilial,
    numRegiao
  );

  try {
    const resProdutoByCodBarra = await Database.querySelection(
      sqlProdutoByCodBarra
    );

    if (!resProdutoByCodBarra) {
      return res.sendStatus(404);
    }

    const dataResponse = formateArrayProdutos(resProdutoByCodBarra);

    return res.json(dataResponse);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

const byMixCliente = async (req, res) => {
  const { codCli, codFilial, numRegiao } = req.query;

  if (!codCli) {
    return res.sendStatus(400).json();
  }

  const sqlProdutoMixCliente = __sqlProdutoMixCliente(
    codCli,
    codFilial,
    numRegiao
  );

  try {
    const resProdutoByMix = await Database.querySelection(sqlProdutoMixCliente);

    if (!resProdutoByMix) {
      return res.sendStatus(404);
    }

    const dataResponse = formateArrayProdutos(resProdutoByMix);

    return res.json(dataResponse);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

module.exports = { byCodigo, byDescricao, byCodigoBarra, byMixCliente };
