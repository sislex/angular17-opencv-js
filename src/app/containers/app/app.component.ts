import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {RectangleComponent} from '../../components/rectangle/rectangle.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';

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
  @ViewChild('image', { static: true }) imageElement!: ElementRef<HTMLImageElement>;
  @ViewChild('myCanvas', { static: true }) myCanvas!: ElementRef<HTMLCanvasElement>;

  worker!: Worker;
  title = 'angular17-opencv-js';
  imageSrcVideo = 'http://192.168.20.135:8080/video';
  coordinates: any[] = [];
  isImageLoaded = false;
  recognitionInterval = 30;

  startTimeRecognition = 0;
  timeRecognition = 0;
  scaleRecognition = 1.4;

  constructor(private cdr:  ChangeDetectorRef) { }

  ngAfterViewInit() {
    this.initWorker();
  }

  initWorker() {
    if (typeof Worker !== 'undefined') {
      // Создаём новый экземпляр Web Worker
      // Указываем путь к файлу воркера в папке assets
      this.worker = new Worker('/assets/workers/openCv-face.js');

      // Подписываемся на сообщения от Web Worker
      this.worker.onmessage = ({ data }) => {
        this.events(data);
      };

      // Подписываемся на ошибки Web Worker
      this.worker.onerror = (error) => {
        console.error(`Ошибка Web Worker:`, error);
      };
    } else {
      // Web Workers не поддерживаются в этом окружении
      console.error('Web Workers не поддерживаются');
    }
  }

  displayImage(imageData: ImageData, canvas = this.myCanvas.nativeElement) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      ctx.putImageData(imageData, 0, 0);
    }
  }

  getImageData(img = this.imageElement.nativeElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    canvas.width = img.naturalWidth/this.scaleRecognition;
    canvas.height = img.naturalHeight/this.scaleRecognition;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  sendImage() {
    this.startTimeRecognition = performance.now();
    const imageData = this.getImageData();
    this.displayImage(imageData);
    this.worker.postMessage({
      event: 'PROCESS_IMAGE',
      data: {
        data: imageData.data.buffer,
        width: imageData.width,
        height: imageData.height,
      },
    }, [imageData.data.buffer]);
  }

  imageLoaded() {
    this.isImageLoaded = true;
  }

  events(message: any) {
    // console.log(message);
    if (message.event === 'CLASSIFIER_LOADED') {
     this.sendImage();
    } else if (message.event === 'COORDINATES') {
      this.coordinates = message.data;
      this.timeRecognition = performance.now() - this.startTimeRecognition;
      this.cdr.detectChanges();

      let interval = this.recognitionInterval - this.timeRecognition;
      if (interval < 0) {
        interval = 0;
      }
      setTimeout(() => {
        this.sendImage();
      }, interval);
    }
  }
}
