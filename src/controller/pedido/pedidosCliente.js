const Database = require("../../database/connection");

const __sqlPedidosCliente = (codCli) => `SELECT pcpedc.numped,
pcpedc.codfilial,
pcpedc.posicao,
to_char(pcpedc.data, 'DD/MM/YYYY') AS DATA
FROM pcpedc
WHERE pcpedc.codcli = ${codCli}
AND pcpedc.posicao != 'C'
ORDER BY pcpedc.data DESC FETCH FIRST 20 ROWS ONLY;`;

const __sqlCliente = (codCli) => `SELECT cliente, fantasia
FROM pcclient
WHERE codcli = ${codCli}`;

const index = async (req, res) => {
  const { codCli } = req.params;

  if (!codCli) {
    return res.sendStatus(400).json();
  }

  const sqlCliente = __sqlCliente(codCli);
  const sqlPedidosCliente = __sqlPedidosCliente(codCli);

  try {
    const dataResponse = {};

    const resCliente = await Database.querySelection(sqlCliente);
    const dadosCliente = resCliente[0];

    if (!dadosCliente) {
      return res.sendStatus(404);
    }

    dataResponse.cliente = {
      codCli,
      nome: dadosCliente.CLIENTE,
      fantasia: dadosCliente.FANTASIA,
    };

    const resPedidosCliente = await Database.querySelection(sqlPedidosCliente);

    dataResponse.pedidos = [];
    for (let pedido of resPedidosCliente) {
      dataResponse.pedidos.push({
        numPed: pedido.NUMPED,
        codFilial: pedido.CODFILIAL,
        posicao: pedido.POSICAO,
        data: pedido.DATA,
      });
    }

    return res.json(dataResponse);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

module.exports = index;
