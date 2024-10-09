const Database = require("../../database/connection");

const __sqlDadosCliente = (codCli) => `SELECT pcclient.CODCLI,
PCCLIENT.CLIENTE,
PCCLIENT.FANTASIA,
PCCLIENT.CODUSUR1 AS RCA,
PCCLIENT.CGCENT AS CPFCNPJ
FROM PCCLIENT
WHERE
PCCLIENT.CODCLI = ${codCli};`;

const index = async (req, res) => {
  const { codCli } = req.params;
  const sqlDadosCliente = __sqlDadosCliente(codCli);

  try {
    const resDadosCliente = await Database.querySelection(sqlDadosCliente);
    const dadosCliente = resDadosCliente[0];

    const dataResponse = {};

    dataResponse.cliente = {
      codCli: dadosCliente.CODCLI,
      cliente: dadosCliente.CLIENTE,
      fantasia: dadosCliente.FANTASIA,
      rca: dadosCliente.RCA,
      cpfcnpj: dadosCliente.CPFCNPJ,
    };

    return res.json(dataResponse);
  } catch (err) {
    console.log(err);
    res.status(500).send("");
  }
};

module.exports = index;
