const fs = require('fs');
const flickr = require('../../lib/providers/flickr').default;

/**
 * @param {string} method Name of Flickr API method to call
 * @param {function} transform Method to transform the result for testing
 * @returns {Promise}
 */
const call = (method, transform) =>
   new Promise((resolve, reject) => {
      fs.readFile(__dirname + '/flickr.' + method + '.json', (err, data) => {
         if (err === null) {
            resolve(transform(JSON.parse(data)));
         } else {
            reject(err);
         }
      });
   });

module.exports = {
   cache: flickr.cache,
   getCollections: () =>
      call('collections.getTree', r => r.collections.collection),
   getAllPhotoTags: () => call('tags.getListUserRaw', r => r.who.tags.tag),
   getPhotoSizes: id => call('photos.getSizes', r => r.sizes.size),
   getPhotoContext: id => call('photos.getAllContexts', r => r.set),
   photoSearch: tags => call('photos.search', r => r.photos.photo),
   getSetInfo: id =>
      call('photosets.getInfo', r => {
         const info = r.photoset;
         info.id = id;
         info.title._content = 'Mock for ' + id;
         return info;
      }),
   getSetPhotos: id =>
      call('photosets.getPhotos', r => {
         const photos = r.photoset;
         photos.id = id;
         photos.title = 'Mock for ' + id;
         return photos;
      }),
   getExif: id =>
      call('photos.getExif', r => {
         const exif = r.photo.EXIF;
         exif.id = id;
         return exif;
      })
};
