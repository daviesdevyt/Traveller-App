var catalyst = require('zcatalyst-sdk-node');

var catalystApp, datastore, cache, zia;
var db = {
	initialize: (req, isDataStoreRequired, isCacheRequired, isZiaRequired) => {
		if (!catalystApp)
			catalystApp = catalyst.initialize(req);

		if (!datastore && isDataStoreRequired)
			datastore = catalystApp.datastore();

		if (!cache && isCacheRequired)
			cache = catalystApp.cache();

		if (!zia && isZiaRequired)
			zia = catalystApp.zia();
	},

	addRowInTable: (table, rowData) => {
		var table = datastore.table(table);
		var insertPromise = table.insertRow(rowData);
		return insertPromise
	},

	queryTable: (query) => {
		return new Promise((resolve, reject) => {
			// Queries the table in the Data Store
			catalystApp.zcql().executeZCQLQuery(query).then(queryResponse => {
				resolve(queryResponse);
			}).catch(err => {
				reject(err);
			})
		});
	},
}

module.exports = db