const unlinkAsync = require('./file');

const deleteUploadedFile = async (filePath) => {
  try {
    if (filePath) await unlinkAsync(filePath);
  } catch (e) {
    // do nothing
    console.log(`Error : ${e}`);
  }
};

module.exports = deleteUploadedFile;
