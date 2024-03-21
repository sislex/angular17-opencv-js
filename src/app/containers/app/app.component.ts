import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {RectangleComponent} from '../../components/rectangle/rectangle.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';

declare var cv: any;
declare var OpenCvUtils: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports:
    [
      CommonModule,
      RouterOutlet,
      RectangleComponent,
      MatSidenavModule,
      MatListModule,
    ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements AfterViewInit {
  @ViewChild('image', { static: true }) imageElement: any;

  title = 'angular17-opencv-js';
  imageNumber = 0;
  imageSrc = 'http://192.168.20.135:8080/shot.jpg';
  imageSrcVideo = 'http://192.168.20.135:8080/video';
  imageSrcWithNumber = '';
  coordinates: any[] = [];
  recognitionTime = 0;
  utils = new OpenCvUtils('errorMessage');
  classifier: any;
  isImageLoaded = false;

  constructor(private cdr:  ChangeDetectorRef) { }

  ngAfterViewInit() {
    this.setImageSrcWithNumber();
    if (cv.getBuildInformation) {
      this.initOpenCv();
    } else {
      cv['onRuntimeInitialized']=()=>{
        this.initOpenCv();
      }
    }
  }

  async initOpenCv() {
    this.classifier = await this.utils.addClassifier( 'haarcascade_frontalface_default.xml', 'assets/cascades/haarcascade_frontalface_default.xml');
    this.coordinates = this.getCoordinates(this.classifier, this.isImageLoaded);
    this.cdr.detectChanges();
  }

  getCoordinates(classifier = this.classifier, isImageLoaded =  this.isImageLoaded) {
    let coordinates = [];
    if (classifier && isImageLoaded) {
      const startTime = performance.now();
      const src = cv.imread(this.imageElement.nativeElement);
      const msize = new cv.Size(0, 0);
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

      const faces = new cv.RectVector();
      classifier.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);
      const coordinatesFaces = this.utils.getCoordinates(faces);
      coordinates = coordinatesFaces.map((coord: any) => ({
        left: `${coord.x}px`,
        top: `${coord.y}px`,
        width: `${coord.width}px`,
        height: `${coord.height}px`
      }));
      console.log('coordinates', coordinates);

      src.delete();
      gray.delete();
      // classifier.delete();
      faces.delete();
      this.recognitionTime = performance.now() - startTime;
    }

    return coordinates;
  }

  imageLoaded() {
    this.isImageLoaded = true;
    setTimeout(() => {
      this.setImageSrcWithNumber();
    }, 0);
    // this.setImageSrcWithNumber();
    this.coordinates = this.getCoordinates(this.classifier, this.isImageLoaded);
    // this.cdr.detectChanges();
  }

  setImageSrcWithNumber() {
    this.imageSrcWithNumber = `${this.imageSrc}?number=${this.imageNumber}`;
    this.imageNumber = this.imageNumber + 1;
    this.cdr.detectChanges();
    console.log(this.imageSrcWithNumber);
  }
}
