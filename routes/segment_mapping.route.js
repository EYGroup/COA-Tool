module.exports = app => {
    const segmentMapping = require('../controllers/segment_mapping.controller');

    app.get('/segmentmapping', segmentMapping.getAll);
    app.post('/segmentmapping', segmentMapping.create);
    app.put('/segmentmapping', segmentMapping.update);
    app.delete('/segmentmapping/:id', segmentMapping.delete);
}