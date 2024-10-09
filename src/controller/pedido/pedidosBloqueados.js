const Database = require("../../database/connection");

const __sqlPedidosBloqueados = () => `SELECT numped,
codcli,
codfilial,
posicao,
codusur as COD_RCA,
to_char(pcpedc.data, 'DD/MM/YYYY') AS DATA
FROM pcpedc
WHERE (posicao = 'B'
OR posicao = 'P')
AND DATA BETWEEN SYSDATE - 11 AND SYSDATE
ORDER BY codfilial,
data,
codcli;`;

const index = async (_, res) => {
  const sqlPedidosBloqueados = __sqlPedidosBloqueados();

  try {
    const dataResponse = {};

    const resPedidosBloqueados = await Database.querySelection(
      sqlPedidosBloqueados
    );

    dataResponse.pedidos = [];
    for (let pedido of resPedidosBloqueados) {
      dataResponse.pedidos.push({
        codCli: pedido.CODCLI,
        numPed: pedido.NUMPED,
        codFilial: pedido.CODFILIAL,
        posicao: pedido.POSICAO,
        data: pedido.DATA,
	codRca: pedido.COD_RCA
      });
    }

    return res.json(dataResponse);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

module.exports = index;
