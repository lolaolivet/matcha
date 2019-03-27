const clientImageObject = (image) => {
  const url = process.env.MATCHA_SERVER_URL;
  return ({
    id: image['image_id'],
    url: image['image_path'].match(/^https?:\/\//) ? image['image_path'] : url + '/assets/' + image['image_name'],
    ownerID: image['owner_id'],
    dateAdded: parseInt(image['created']),
    encoding: image['image_encoding'],
    mimetype: image['mimetype'],
    size: image['size'],
    isMain: image['main_pic'],
  });
};

module.exports = clientImageObject;
