var mysql = require("mysql");

function getInsertSql() {
	let user = "<user>";
	let password = "<password>";
	let host = "<host>";
	let database = "<database>";
	let destinationDatabase = "<destinationDatabase>";

	let session = mysql.getSession(`${user}:${password}@${host}?ssl-mode=disabled`);

	session.runSql(`USE ${database}`);

	let dbIdSql = `SELECT db_id FROM ${database}.database_info WHERE status IN (1, 2, 3, 5)`;
	let dbIdResult = session.runSql(dbIdSql);
	let dbIdRows = dbIdResult.fetchAll();

	let valueSql = "";
	for (let i = 0; i < dbIdRows.length; ++i) {
		let dbId = dbIdRows[i]['db_id'];
		valueSql += `('${dbId}', NOW()),`;
	}

	let valueSqlWithoutTrailingComma = valueSql.substring(0, valueSql.length - 1);

	let insertSql = `INSERT INTO ${destinationDatabase}.database_audit VALUES`
	+ ` ${valueSqlWithoutTrailingComma}`
	+ ` ON DUPLICATE KEY UPDATE last_indexed_at = NOW()`;

	session.close();

	return insertSql;
}

function executeInsertSql(insertSql) {
	let user = "<user>";
	let password = "<password>";
	let host = "<host>";
	let destinationDatabase = "<destinationDatabase>";

	let session = mysql.getSession(`${user}:${password}@${host}?ssl-mode=disabled`);

	session.runSql(`USE ${destinationDatabase}`);

	let insertResult = session.runSql(insertSql);

	session.close();
}

var insertSql = getInsertSql();
executeInsertSql(insertSql);
