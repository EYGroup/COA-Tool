module.exports = app => {

    const mappingValue = require('../controllers/mapping_values.controller');

    app.get('/mappingvalue', mappingValue.getAll);
    app.post('/mappingvalue', mappingValue.create);
    app.put('/mappingvalue', mappingValue.update);
    app.delete('/mappingvalue/:id', mappingValue.delete);

}