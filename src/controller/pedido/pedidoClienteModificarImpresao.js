const Database = require("../../database/connection");

const __sqlModificarImpressaoPedido = (numPed) => `
UPDATE pcpedc
SET numviasmapasep = 1
WHERE numped = ${numPed}
AND PCPEDC.POSICAO IN ('L', 'B', 'P', 'M')
AND ROWNUM = 1;`;

function isInteger(str) {
  return !isNaN(parseInt(str)) && isFinite(parseInt(str));
}

const index = async (req, res) => {
  const { numPed } = req.params;
  const sqlModificarImpressaoPedido = __sqlModificarImpressaoPedido(numPed);

  try {
    if (!isInteger(numPed)) {
      throw new Error("numPed is not integer");
    }

    const resUpdateDB = await Database.querySelection(
      sqlModificarImpressaoPedido
    );

    if (resUpdateDB.count > 0) {
      return res.status(200).send("");
    } else {
      return res.status(400).send("");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("");
  }
};

module.exports = index;
