const Database = require("../../database/connection");

const __sqlFilial = () => `SELECT codigo,
razaosocial
FROM pcfilial
ORDER BY codigo`;

const index = async (_, res) => {
  const sqlFilial = __sqlFilial();
  try {
    const resFilial = await Database.querySelection(sqlFilial);

    const dataResponse = {};

    dataResponse.filial = [];
    for (let filial of resFilial) {
      dataResponse.filial.push({
        codigo: filial.CODIGO,
        razaosocial: filial.RAZAOSOCIAL,
      });
    }

    return res.json(dataResponse);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

module.exports = index;
