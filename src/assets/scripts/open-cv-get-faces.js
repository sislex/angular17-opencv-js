function openCvGetFaces() {
  this.createFileFromUrl = function(path, url, callback) {
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function(ev) {
      if (request.readyState === 4) {
        if (request.status === 200) {
          let data = new Uint8Array(request.response);
          cv.FS_createDataFile('/', path, data, true, false, false);
          callback();
        } else {
          // this.printError('Failed to load ' + url + ' status: ' + request.status);
        }
      }
    };
    request.send();
  };
  this.addClassifier = function(path, url) {
    return  new Promise((resolve, reject) => {
      const classifier = new cv.CascadeClassifier();
      this.createFileFromUrl(path, url, () => {
        classifier.load(path);
        resolve(classifier);
      });
    });
  };

  this.getCoordinates = function(rectVector) {
    const coordinates = [];
    for (let i = 0; i < rectVector.size(); ++i) {
      coordinates.push(rectVector.get(i));
    }

    return coordinates;
  };
}
