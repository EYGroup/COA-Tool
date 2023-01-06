module.exports = app => {

    const appDefinition = require('../controllers/app_definition.controller');

    app.get('/appdefinition', appDefinition.getAll);
    app.get('/appdefinition/:id', appDefinition.getById);
    app.get('/appdefinitionbytype', appDefinition.getAllAppByType);
    app.post('/appdefinition', appDefinition.create);
    app.put('/appdefinition', appDefinition.update);
    app.delete('/appdefinition/:id', appDefinition.delete);
    

}