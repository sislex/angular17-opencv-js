import {ICoordinatesItem} from '../+state/targets/targets.reducer';

export  const getDistanceFromCenter = (coordinates: any) => {
  const left = 1 * coordinates.left + coordinates.width / 2;
  const top = 1 * coordinates.top + coordinates.height / 2;

  const centerX = 50;
  const centerY = 50;

  return {
    left: left - centerX,
    top: top - centerY,
    width: (parseFloat(coordinates.width) + parseFloat(coordinates.height)) / 2,
  };
}

export const findNearestPointToCenter = (coordinates: ICoordinatesItem[]) => {
  const getDistanceFromCenterList: {left: number, top: number, width: number}[] = coordinates.map((item: any) => getDistanceFromCenter(item));
  let minDistance = 1000000;
  let nearestPoint: any = {x: 0, y: 0, width: 0, height: 0};

  getDistanceFromCenterList.forEach((item, key) => {
    const distance = Math.sqrt(item.left * item.left + item.top * item.top);
    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = coordinates[key];
    }
  });

  return nearestPoint;
}

export const   getIntervalTime = (recognitionTime: number, recognitionInterval : number) =>  {
  let interval = recognitionInterval - recognitionTime;
  if (interval < 0) {
    interval = 0;
  }

  return interval;
}
