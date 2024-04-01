importScripts('/assets/scripts/opencv.js', '/assets/scripts/open-cv-get-faces.js');
init();
let utils;
let classifier;
self.addEventListener('message', function(e) {
  const message = e.data;
  if (message.event === 'PROCESS_IMAGE') {
    const startTimeRecognition = performance.now();
    const { data, width, height } = message.data;
    const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
    // console.log('imageData', imageData);

    const coordinates = getCoordinates(imageData, classifier);
    self.postMessage({event: 'COORDINATES', data: {
        coordinates,
        recognitionTime: Math.round(performance.now() - startTimeRecognition)
      }});
  }
  const result = 'Результат работы: ' + message.event ;
  self.postMessage(result);


});

function init() {
  if (cv.getBuildInformation) {
    initClassifier();
  } else {
    cv['onRuntimeInitialized']=()=>{
      initClassifier();
    }
  }
}

async function initClassifier() {
  utils = new openCvGetFaces();
  classifier = await utils.addClassifier( 'haarcascade_frontalface_default.xml', '../cascades/haarcascade_frontalface_default.xml');
  self.postMessage({event: 'CLASSIFIER_LOADED'});
}

function getCoordinates(imageData, classifier) {
  let coordinates = [];
  if (classifier) {
    let src = cv.matFromImageData(imageData);
    const msize = new cv.Size(0, 0);
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    const faces = new cv.RectVector();
    classifier.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);
    const coordinatesFaces = utils.getCoordinates(faces);
    coordinates = coordinatesFaces.map((coord) => ({
      left: `${(coord.x/imageData.width) * 100}`,
      top: `${(coord.y/imageData.height) * 100}`,
      width: `${(coord.width/imageData.width) * 100}`,
      height: `${(coord.height/imageData.height )* 100}`
    }));

    src.delete();
    gray.delete();
    // this.classifier.delete();
    faces.delete();
  }

  return coordinates;
}

