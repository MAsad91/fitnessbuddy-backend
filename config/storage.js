const Storage = require('@google-cloud/storage').Storage;

const storage = new Storage({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

module.exports = {
  bucket: bucket,
  getPublicUrl: function(filename) {
    return 'https://storage.googleapis.com/' + process.env.GOOGLE_CLOUD_BUCKET_NAME + '/' + filename;
  }
};
