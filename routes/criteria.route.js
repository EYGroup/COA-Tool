module.exports = app => {
    const criteria = require('../controllers/criteria.controller');

    app.get('/criteria/:id', criteria.getCriteriaById);
    app.get('/criteria', criteria.getAllCriteria);
    app.post('/criteria', criteria.create);
    app.put('/criteria', criteria.update);
    app.delete('/criteria/:id', criteria.delete);
}