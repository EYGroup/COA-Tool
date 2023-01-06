module.exports = app => {
    const segmentDefinition = require('../controllers/segment_definition.controller');

    app.get('/segmentdefinition/:id', segmentDefinition.getSegmentsByApplicationId);
    app.post('/segmentdefinition', segmentDefinition.create);
    app.put('/segmentdefinition', segmentDefinition.update);
    app.delete('/segmentdefinition/:id', segmentDefinition.delete);
    app.get('/segmentdefinition',segmentDefinition.getAllSegments)
}