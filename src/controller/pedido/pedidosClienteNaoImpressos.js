const Database = require("../../database/connection");

const __sqlPedidosNaoImpressos = (codFilial = false) => `SELECT 
numped,
codcli,
posicao,
codFilial
FROM pcpedc
WHERE TRUNC(DATA) = TRUNC(SYSDATE)
  ${codFilial ? `AND codfilial = ${codFilial}` : ""}
  AND codcli != 1
  AND CODUSUR != 35
  AND dtemissaomapa IS NULL;`;

const index = async (req, res) => {
  const { codFilial } = req.query;

  const sqlPedidosNaoImpressos = __sqlPedidosNaoImpressos(codFilial);

  try {
    const resPedidosNaoImpressos = await Database.querySelection(
      sqlPedidosNaoImpressos
    );

    const dataResponse = {};
    dataResponse.pedidos = [];

    for (let pedido of resPedidosNaoImpressos) {
      dataResponse.pedidos.push({
        codCli: pedido.CODCLI,
        numped: pedido.NUMPED,
        posicao: pedido.POSICAO,
        codFilial: pedido.CODFILIAL,
      });
    }
    dataResponse.totPedidosNaoImpressos = resPedidosNaoImpressos.length;

    return res.json(dataResponse);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

module.exports = index;
