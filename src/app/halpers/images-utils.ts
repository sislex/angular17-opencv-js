export  const   getImageData = (
  img: HTMLImageElement | HTMLVideoElement,
  size: {width: number, height: number} = {
    width:  640,
    height: 480
  }
) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  canvas.width = size.width;
  canvas.height =size.height;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
