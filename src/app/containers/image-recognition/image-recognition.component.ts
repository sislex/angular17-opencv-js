import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import {RectangleComponent} from '../../components/rectangle/rectangle.component';
import {Store} from '@ngrx/store';
import {getSelectedSideMenuItem} from '../../+state/view/view.selectors';
import {AsyncPipe} from '@angular/common';
import {take} from 'rxjs';

@Component({
  selector: 'app-image-recognition',
  standalone: true,
  imports: [
    RectangleComponent,
    AsyncPipe
  ],
  templateUrl: './image-recognition.component.html',
  styleUrl: './image-recognition.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageRecognitionComponent  implements AfterViewInit {
  @ViewChild('image', { static: false }) imageElement!: ElementRef<HTMLImageElement>;
  @ViewChild('video', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  getSelectedSideMenuItem$ = this.store.select(getSelectedSideMenuItem).pipe(take(1));

  isImageLoaded = false;
  isClassifierLoaded = false;

  worker!: Worker;
  coordinates: any[] = [];

  isRecognizing = false;
  startTimeRecognition = 0;
  timeRecognition = 0;

  // settings
  scaleRecognition = 4.5;
  // video only
  isVideo = false;
  recognitionInterval = 0;

  constructor(private readonly store: Store, private cdr:  ChangeDetectorRef) {
    console.log('ImageRecognitionComponent');
    this.getSelectedSideMenuItem$.subscribe((selectedItem) => {
      if (selectedItem) {
        this.scaleRecognition = selectedItem.data.scaleRecognition;

        this.isVideo = selectedItem.data.isVideo;
        this.recognitionInterval = selectedItem.data.recognitionInterval;
      }
    });
  }

  ngAfterViewInit() {
    this.worker = this.initWorker( '/assets/workers/openCv-face.js');
  }

  ngOnDestroy() {
    if (this.worker) {
      this.worker.terminate();
    }
    if (this.imageElement && this.imageElement.nativeElement) {
      // Очистка источника изображения
      this.imageElement.nativeElement.src = '';
    }
  }

  initWorker(workerUrl: string) {
    let worker!: Worker;
    if (typeof Worker !== 'undefined') {
      worker = new Worker(workerUrl);

      worker.onmessage = ({ data }) => {
        this.events(data);
      };

      worker.onerror = (error) => {
        console.error(`Ошибка Web Worker:`, error);
      };
    } else {
      console.error('Web Workers не поддерживаются');
    }

    return worker;
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
    if (this.isImageLoaded && this.isClassifierLoaded) {
      this.isRecognizing = true;
      this.startTimeRecognition = performance.now();
      const imageData = this.getImageData();
      this.worker.postMessage({
        event: 'PROCESS_IMAGE',
        data: {
          data: imageData.data.buffer,
          width: imageData.width,
          height: imageData.height,
        },
      }, [imageData.data.buffer]);
    }
  }

  imageLoaded() {
    this.isImageLoaded = true;
    if (this.startTimeRecognition === 0) {
      this.sendImage();
    }
  }

  events(message: any) {
    // console.log(message);
    if (message.event === 'CLASSIFIER_LOADED') {
      this.isClassifierLoaded = true;
      this.sendImage();
      this.cdr.detectChanges();
    } else if (message.event === 'COORDINATES') {
      this.coordinates = message.data;
      this.timeRecognition = performance.now() - this.startTimeRecognition;
      this.isRecognizing = false;
      this.cdr.detectChanges();

      if (this.isVideo) {
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
}
