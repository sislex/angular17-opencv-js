import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

declare var cv: any;
declare var OpenCvUtils: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit{
  title = 'angular17-opencv-js';

  @ViewChild('image', { static: true }) imageElement: any;

  constructor() { }

  ngAfterViewInit() {
    if (cv.getBuildInformation) {
      this.detect();
    } else {
      cv['onRuntimeInitialized']=()=>{
        this.detect();
      }
    }
  }

  async detect() {
    const utils = new OpenCvUtils('errorMessage');
    const classifier = await utils.addClassifier( 'haarcascade_upperbody.xml', 'assets/cascades/haarcascade_upperbody.xml');

    let imgElement = this.imageElement.nativeElement;
    let src = cv.imread(imgElement);
    const msize = new cv.Size(0, 0);
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);



    const faces = new cv.RectVector();
    const startTime = performance.now();
    classifier.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);
    console.log('classifier loaded in ' + (performance.now() - startTime) + 'ms');
    const coordinatesFaces = utils.getCoordinates(faces);
    console.log(coordinatesFaces);



    src.delete();
    gray.delete();
    classifier.delete();
    faces.delete();
  }
}
