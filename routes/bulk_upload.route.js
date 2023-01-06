module.exports = app => {

    const bulkUpload = require('../controllers/bulk_upload.controller');

    app.post('/bulkupload', bulkUpload.create);

}