export const initCamera = (videoElement: HTMLVideoElement) => {
  if (videoElement) {
    navigator.mediaDevices.getUserMedia({video: {width: {exact: 640}, height: {exact: 480}}, audio: false})
      .then(function(stream) {
        // console.log('Camera Started');
        videoElement.srcObject = stream;
        videoElement.play();
        videoElement.addEventListener('canplay', () => {
          // console.log('canplay');
        }, false);
      })
      .catch(function(err) {
        console.error('Camera Error: ' + err.name + ' ' + err.message);
      });
  }
}

export const destroyCamera = (videoElement: HTMLVideoElement) => {
  if (videoElement && videoElement.pause) {
    videoElement.pause();
    if ((videoElement as any).srcObject) {
      (videoElement as any).srcObject.getVideoTracks()[0].stop();
    }
    videoElement.srcObject = null;
  }
}
