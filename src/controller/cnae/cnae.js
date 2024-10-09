const Database = require("../../database/connection");

const __sqlCnae = (cnae) => `SELECT
codcnae, desccnae, CODATIV1
FROM PCCNAE
where codcnae='${cnae}'`;

const index = async (req, res) => {
  const { cnae } = req.params;

  if (!cnae) {
    return res.sendStatus(400).json();
  }

  let cnaeFormatado = cnae.replace(/\D/g, "");
  cnaeFormatado =
    cnaeFormatado.slice(0, 4) +
    "-" +
    cnaeFormatado.slice(4, 5) +
    "/" +
    cnaeFormatado.slice(5);

  const sqlCnae = __sqlCnae(cnaeFormatado);
  try {
    const resCnae = await Database.querySelection(sqlCnae);
    const dadosCnae = resCnae[0];

    if (!dadosCnae) {
      return res.sendStatus(404);
    }

    const dataResponse = {
      cnae: dadosCnae.CODCNAE,
      descricao: dadosCnae.DESCCNAE,
      atividade: dadosCnae.CODATIV1,
    };

    return res.json(dataResponse);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

module.exports = index;
