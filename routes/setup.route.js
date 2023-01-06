module.exports = app => {

    const setup = require('../controllers/setup.controller');

    app.get('/testConnection', setup.testConnection);

}