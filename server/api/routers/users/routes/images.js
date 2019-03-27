const format = require('pg-format');
const db = require('../../../common/db');
const express = require('express');
const userExists = require('../../../common/user-exists');
const clientImageObject = require('../../../common/client-image-object');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});

// Multipart form upload modules
const multer = require('multer');
const crypto = require('crypto');
const mime = require('mime');

const fs = require('fs');
const path = require('path');
const mv = require('mv');

const USER_IMAGE_BUDGET = 5;

const insertIntoTable = require('../../../common/functions').insertIntoTable;

const deleteArrayOfImages = async (arr) => {
  for (let n in arr) {
    let im = arr[n];
    await db.query('DELETE FROM images WHERE image_name = $1 AND image_path = $2', [im['image_name'], im['image_path']]);
  }
};

const insertArrayOfImages = async (images) => {
  // Returns the array of corresponding ids

  // Insert all images one by one and gather their ids
  var ids = [];
  for (let n in images) {
    try {
      var queryRes = await insertIntoTable('images', images[n]);
      ids.push(queryRes.rows[0]['image_id']);
    } catch (err) {
      // If something goes wrong undo everything and throw
      await deleteArrayOfImages(images);
      throw (err);
    }
  }
  return (ids);
};

const mvPromised = (src, dst) => new Promise((resolve, reject) => {
  mv(src, dst, (err) => {
    if (err) return (reject(err));
    return (resolve(true));
  });
});

/**
 * Routes
 */

router.get('/', (req, res) => {
  let request;
  request = format('SELECT * FROM images WHERE owner_id = %L;', req.params.userid);
  db.query(request, (err, result) => {
    if (err) {
      res.status(400).send('Error 400');
    } else {
      res.status(200).send(result.rows.map(clientImageObject));
    }
  });
});

// Where the images are stored
const staticDirPath = path.join(__dirname, '../../../assets');
const temporaryLocation = path.join(__dirname, '../../../.tmp');
if (!fs.existsSync(temporaryLocation)) {
  fs.mkdirSync(temporaryLocation);
}
// How the images are stored
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, temporaryLocation);
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(3, (err, raw) => {
      if (err) throw err;
      cb(null, Date.now() + '_' + raw.toString('hex') + '.' + mime.getExtension(file.mimetype));
    });
  }
});
// Create Upload middleware
const uploader = multer({ storage }).array('image');

// File validator
const fileUploadValidator = (files) => {
  const mimetypes = ['image/gif', 'image/jpeg', 'image/pjpeg', 'image/x-png', 'image/png'];
  const maxByteSize = 2e+6;
  var message;
  var result = true;

  for (let i in files) {
    // Check all files are images
    if (!mimetypes.includes(files[i].mimetype)) {
      result = false;
      message = 'Payload rejected : Invalid file type';
      break;
    }
    // Check that the images are not too heavy
    if (files[i].size > maxByteSize) {
      result = false;
      message = 'Payload rejected : Maximum file size exceded';
      break;
    }
  }

  return ({
    result,
    message
  });
};

// Delete each file (if exist) from disk
const unlinkFiles = (files) => {
  files.map(file => (fs.existsSync(file.path) && fs.unlinkSync(file.path)));
};

// Get the user's images
const getUserImages = async (userid) => {
  let request = format('SELECT * FROM images WHERE owner_id = %L;', userid);
  let result = await db.query(request);
  return (result.rows);
};

router.post('/',
  // Check header
  (req, res, next) => {
    // If the request is not a multipart/form-data --> 400

    // Check the multipart/form-data header
    var ct = req.headers['content-type'];
    if (ct && ct.includes('multipart/form-data')) {
      // If it is presend
      // continue
      return (next());
    }
    // If not
    // send 400
    return (res.status(400).send({
      message: 'Missing header Content-Type:multipart/form-data'
    }));
  },

  // Upload to tmp location
  uploader,

  // Check that something was uploaded
  (req, res, next) => {
    // If no file were uploaded --> 400

    // Check that the files array exists and has content
    if (req.files !== undefined && req.files.length !== 0) {
      // If so
      // continue
      return (next());
    }

    // If files array is empty
    // send 400
    return (res.status(400).send({
      message: 'No files provided'
    }));
  },

  // User's image budget
  async (req, res, next) => {
    // If the user's image budget is exceeded --> 422

    // Get the user's images
    var userImages;
    try {
      userImages = await getUserImages(req.params.userid);
    } catch (err) {
      unlinkFiles(req.files);
      return (res.status(500).end());
    }

    // Check that the budget is not exceeded
    if (req.files.length + userImages.length <= USER_IMAGE_BUDGET) {
      // If the budget is respected
      // continue
      res.locals.images = userImages;
      return (next());
    }

    // If not
    // delete the files and send 422
    unlinkFiles(req.files);
    return (res.status(422).send({
      message: 'Too many files'
    }));
  },

  // Validate the files (size, mimetype)
  (req, res, next) => {
    // If some files are not valid --> 422

    // Validate
    var validation = fileUploadValidator(req.files);
    if (validation.result === true) {
      // If valid
      // continue
      return (next());
    }

    // If invalid
    // delete the files and send 422
    unlinkFiles(req.files);
    return (res.status(422).send({ message: validation.message }));
  },

  // Save infos to the database
  async (req, res, next) => {
    var newImages = [];
    var files = [];
    for (let i in req.files) {
      const file = req.files[i];

      const fullPath = path.join(staticDirPath, file.filename);
      files.push({ ...req.files, path: fullPath });
      await mvPromised(file.path, fullPath);

      // If user has no images yet
      // choose (arbitrarily) first image as main image
      const isMain = (parseInt(i) === 0 && res.locals.images.length === 0);
      newImages.push({
        'image_name': file.filename,
        'image_path': staticDirPath,
        'owner_id': req.params.userid,
        'created': Date.now(),
        'image_encoding': file.encoding,
        'mimetype': file.mimetype,
        'size': file.size,
        'main_pic': isMain,
      });
    }

    // Insert array of images
    let ids;
    try {
      ids = await insertArrayOfImages(newImages);
      ids.map((id, index) => {
        newImages[index]['image_id'] = id;
      });
    } catch (err) {
      // In case of error
      // delete the files and send 500
      unlinkFiles(files);
      return (res.status(500).send({ message: 'Could not update user' }));
    }

    // If everything went fine
    // pass on the images
    res.locals.images = [...res.locals.images, ...newImages]; // Join old and new images in one array
    // and continue
    return (next());
  },

  // Respond
  (_, res) => {
    // Send the images (description object, not actual images)
    res.status(201).send(res.locals.images.map(clientImageObject));
  }
);

router.delete('/',
  // Check that the request is not empty --> 400
  (req, res, next) => {
    // If no body or empty body
    if (!req.body || !req.body.ids) {
      return (
        res.status(400).send({
          message: 'Nothing to delete',
          code: 400
        })
      );
    }

    // If body not array
    if (!(req.body.ids instanceof Array)) {
      req.body.ids = [req.body.ids];
    }

    // If body too long
    if (req.body.ids.length > USER_IMAGE_BUDGET) {
      return (
        res.status(400).send({
          message: 'Nothing to delete',
          code: 400
        })
      );
    }
    return (next());
  },

  // Check that the images exist in the db and belong to the user --> 500 || 403
  async (req, res, next) => {
    // Get the user's images array
    try {
      var images = await getUserImages(req.params.userid);
    } catch (err) {
      console.error(err);
      return (
        res.status(500).send({
          message: 'Server Error',
          code: 500
        })
      );
    }

    // Create an array of the ids of the user's images
    var userImageIds = images.reduce((acc, im) => {
      acc.push(im['image_id']);
      return (acc);
    }, []);

    // Compare the ids of the request to the ids in userImageIds
    var allBelongToUser = req.body.ids.reduce((acc, id) => {
      return (acc && userImageIds.includes(id));
    }, true);

    if (!allBelongToUser) {
      // If not all images in the request belong to the user
      // Send 403
      return (
        res.status(403).send({
          message: 'Images don\'t belong to user',
          code: 403
        })
      );
    }

    // Check that the images to delete don't contain the main image
    for (let i in images) {
      if (
        images[i]['main_pic'] &&
        req.body.ids.includes(images[i]['image_id'])
      ) {
        return (
          res.status(403).send({
            message: 'User can\'t delete main image',
            code: 403
          })
        );
      }
    }

    var imagesToDelete = images.filter(im => {
      return (req.body.ids.includes(im['image_id']));
    });

    // Otherwise
    // pass the images to delete
    res.locals.imagesToDelete = imagesToDelete;
    // continue
    return (next());
  },

  // Delete on the fs and the db
  async (_, res, next) => {
    var imagesToDelete = res.locals.imagesToDelete;

    try {
      await deleteArrayOfImages(imagesToDelete);
      unlinkFiles(imagesToDelete.map(im => {
        return { path: path.join(im['image_path'], im['image_name']) };
      }));
    } catch (error) {
      console.error(error);
      return (
        res.status(500).send({
          message: 'Server Error',
          code: 500
        })
      );
    }

    return (next());
  },

  // Respond --> 202
  (_, res) => {
    res.status(202).end();
  }
);

router.put('/', async (req, res) => {
  const userid = req.body.ownerId;
  const imageid = req.body.imageId;
  if (!userid || !imageid) {
    return (
      res.status(400).send({
        message: 'Bad Request: Missing parameter',
        code: 400
      })
    );
  }
  try {
    const user = (await userExists.fn(userid));
    const img = (await db.query(
      `SELECT * FROM images WHERE image_id = $1;`, [imageid]
    )).rows[0];
    if (!img || !user) {
      // if user and image does not exist
      return res.status(404).send({
        message: 'User Not Found',
        code:
          (!user) // is user fake ?
            ? (!img) // is img fake ?
              ? 4043 // both fake
              : 4042 // only user fake
            : 4041 // only img fake
      });
    }
    if (parseInt(userid) !== parseInt(req.user.id)) {
      return (
        res.status(403).send({
          message: 'Unauthorized (Restricted action)',
          code: 403
        })
      );
    }
    // update main_pic bool in db
    let query1 = `UPDATE images SET main_pic = false WHERE image_id <> $1 AND owner_id = $2`;
    await db.query(query1, [imageid, userid]);
    let query2 = `UPDATE images SET main_pic = true WHERE image_id = $1 AND owner_id = $2`;
    await db.query(query2, [imageid, userid]);
  } catch (error) {
    console.error(error);
    return (res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    }));
  }

  return (
    res.status(204).end()
  );
});

module.exports = router;
