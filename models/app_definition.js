const oracleDb = require('oracledb');

const AppDefinition = function(appDefinition) {
    this.applicationName = appDefinition.applicationName;
    this.description = appDefinition.description;
    this.startDate = appDefinition.startDate;
    this.endDate = appDefinition.endDate;
    this.isSource = appDefinition.isSource;
    this.isTarget = appDefinition.isTarget;
    this.isEnabled = appDefinition.isEnabled;
}

AppDefinition.getAll = () => {}