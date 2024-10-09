const Database = require("../../database/connection");

const __sqlPrecoUltimaEntrada = (listCodProd, cnpj) => `SELECT
PCF.CODPROD,
PCF.CODFORNEC,
PF.FORNECEDOR,
PP.DESCRICAO AS NOME_PRODUTO,
PCF.CODFAB,
PP.QTUNITCX AS QT_MASTER,
PE.CODFILIAL,
round((SELECT MIN(ptabela) FROM pcmov WHERE codprod = PP.CODPROD AND codoper = 'E' AND codfornec NOT IN (257, 322, 504) AND dtmov = (SELECT max(dtmov) fROM pcmov WHERE codprod = PP.CODPROD AND codoper = 'E'AND codfornec NOT IN (257, 322, 504))), 2) as CUSTOFIN,
PE.DTULTENT,
round(PTB.PTABELA, 2) AS PRECO_TAB
FROM PCCODFABRICA PCF,
PCFORNEC PF,
PCEST PE,
PCPRODUT PP,
PCTABPR PTB
WHERE PF.CODFORNEC = PCF.CODFORNEC
AND PTB.NUMREGIAO = 1
AND PTB.CODPROD = PE.CODPROD
AND PP.CODPROD = PE.CODPROD
AND PCF.CODPROD = PE.CODPROD
AND (REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(PF.CGC, '[./-]', ''), ' ', ''), ' ', '') = '${cnpj}'
OR PF.CGC = '${cnpj}')
AND PE.DTULTENT =
(SELECT max(P2.DTULTENT)
FROM pcest P2
WHERE PE.codprod = P2.CODPROD)
AND PCF.CODFAB IN (${listCodProd})
ORDER BY 
    DECODE(PCF.CODFAB, ${listCodProd});`;    
    

const index = async (req, res) => {
  const codFabricaReq = req.body.codFabrica;
  const cnpjFornecedorReq = req.body.cnpjFornecedor;    

  if (!codFabricaReq || !cnpjFornecedorReq) {
    return res.sendStatus(400).json();
  }

  let listaProdutos = codFabricaReq;
  if (typeof listaProdutos === "string") {
    listaProdutos = [listaProdutos];
  }

  const strListaProdutos = listaProdutos
    .map((codProd) => `'${codProd}'`)
    .join(", ");

  const sqlPrecoUltimaEntrada = __sqlPrecoUltimaEntrada(
    strListaProdutos,
    cnpjFornecedorReq
  );

  try {
    const dataResponse = [];

    const resPrecoUltimaEntrada = await Database.querySelection(
      sqlPrecoUltimaEntrada
    );

    for (let produto of resPrecoUltimaEntrada) {
      const produtoDB = {
        codProd: produto.CODPROD,
        nomeProd: produto.NOME_PRODUTO,
        codFornec: produto.CODFORNEC,
        fornecedor: produto.FORNECEDOR,
        codFab: produto.CODFAB,
        codFilial: produto.CODFILIAL,
        custo: parseFloat(produto.CUSTOFIN),
        dtUltEnt: new Date(produto.DTULTENT),
        precoTab: parseFloat(produto.PRECO_TAB),
		qtMaster: produto.QT_MASTER,
      };

      dataResponse.push(produtoDB);
    }

    return res.json(dataResponse);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

module.exports = index;
