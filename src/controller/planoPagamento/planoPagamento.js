const Database = require("../../database/connection");

const __sqlPlanoPagamento = () => `select
CODPLPAG,
DESCRICAO,
(
    CASE WHEN PRAZO1 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN PRAZO2 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN PRAZO3 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN PRAZO4 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN PRAZO5 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN PRAZO6 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN PRAZO7 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN PRAZO8 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN PRAZO9 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN PRAZO10 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN PRAZO11 IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN PRAZO12 IS NOT NULL THEN 1 ELSE 0 END
) AS QTD_PARCELAS
from pcplpag
where 
STATUS = 'A'
AND USAMULTIFILIAL = 'S'
ORDER BY QTD_PARCELAS,
NUMDIAS
;`;

const index = async (req, res) => {
  const sqlPlanoPagamento = __sqlPlanoPagamento();

  try {
    const dataResponse = {};

    const resPlanoPagamento = await Database.querySelection(sqlPlanoPagamento);

    dataResponse.planoPagamento = [];
    for (let planoPagamento of resPlanoPagamento) {
      dataResponse.planoPagamento.push({
        codPlanoPagamento: planoPagamento.CODPLPAG,
        descricao: planoPagamento.DESCRICAO,
        qtdParcelas: planoPagamento.QTD_PARCELAS,
      });
    }

    return res.json(dataResponse);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

module.exports = index;
