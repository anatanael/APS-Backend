const Database = require("../../database/connection");

const __sqlDadosCliente = (listCodRca) => `SELECT pcclient.CODCLI,
PCCLIENT.CLIENTE,
PCCLIENT.FANTASIA,
PCCLIENT.CODUSUR1 AS RCA,
PCCLIENT.CGCENT AS CPFCNPJ
FROM PCCLIENT
WHERE
PCCLIENT.CODUSUR1 in ${listCodRca}
AND PCCLIENT.DTEXCLUSAO IS NULL
ORDER BY PCCLIENT.CODCLI;`;

const index = async (req, res) => {
  const { codRca } = req.query;

  let listRca = [];
  if (Array.isArray(codRca)) {
    listRca = codRca;
  } else {
    listRca = [codRca];
  }

  const listCodRca = `(${listRca.join(",")})`;

  const sqlDadosCliente = __sqlDadosCliente(listCodRca);

  try {
    const resDadosCliente = await Database.querySelection(sqlDadosCliente);

    const dataResponse = {};

    dataResponse.clientes = [];
    for (let dadosCliente of resDadosCliente) {
      dataResponse.clientes.push({
        codCli: dadosCliente.CODCLI,
        cliente: dadosCliente.CLIENTE,
        fantasia: dadosCliente.FANTASIA,
        rca: dadosCliente.RCA,
        cpfcnpj: dadosCliente.CPFCNPJ,
      });
    }

    return res.json(dataResponse);
  } catch (err) {
    console.log(err);
    res.status(500).send("");
  }
};

module.exports = index;
