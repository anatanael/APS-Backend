const odbc = require("odbc");

const ODBC_TYPE = process.env.ODBC_TYPE;
const ODBC_USER = process.env.ODBC_USER;
const ODBC_PASSWORD = process.env.ODBC_PASSWORD;

const connectionType =
  process.platform === "win32" ? `DSN=${ODBC_TYPE}` : `DRIVER={${ODBC_TYPE}}`;
const connectionString = `${connectionType};UID=${ODBC_USER};PWD=${ODBC_PASSWORD}`;

class Database {
  static connection = null;

  static openConnection = async () => {
    this.connection = await odbc.connect({
      connectionString,
    });

    console.log("Connection successful");
  };

  static closeConnection = async () => {
    await this.connection.close();
  };

  static querySelection = async (sql) => {
    if (!this.connection) {
      await this.openConnection();
    }

    try {
      const data = await this.connection.query(sql);

      return data;
    } catch (err) {
      console.log(err);

      await this.openConnection();
      return [];
    }
  };
}

module.exports = Database;
