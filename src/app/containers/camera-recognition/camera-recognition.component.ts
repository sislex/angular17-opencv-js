import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef, OnDestroy,
  ViewChild
} from '@angular/core';
import {RectangleComponent} from '../../components/rectangle/rectangle.component';
import {Store} from '@ngrx/store';
import {getSelectedSideMenuItem} from '../../+state/view/view.selectors';
import {AsyncPipe} from '@angular/common';
import {take} from 'rxjs';
import {addCoordinates} from '../../+state/targets/targets.actions';
import {getOverageRecognitionTime} from '../../+state/targets/targets.selectors';

@Component({
  selector: 'app-camera-recognition',
  standalone: true,
  imports: [
    RectangleComponent,
    AsyncPipe
  ],
  templateUrl: './camera-recognition.component.html',
  styleUrl: './camera-recognition.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CameraRecognitionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  getSelectedSideMenuItem$ = this.store.select(getSelectedSideMenuItem).pipe(take(1));
  getOverageRecognitionTime$ = this.store.select(getOverageRecognitionTime);

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
  src = '';
  isVideo = false;
  recognitionInterval = 0;

  constructor(private readonly store: Store, private cdr:  ChangeDetectorRef) {
    this.getSelectedSideMenuItem$.subscribe((selectedItem) => {
      if (selectedItem) {
        this.scaleRecognition = selectedItem.data.scaleRecognition;

        this.isVideo = selectedItem.data.isVideo;
        this.src = selectedItem.data.src;
        this.recognitionInterval = selectedItem.data.recognitionInterval;
      }
    });
  }

  ngAfterViewInit() {
    this.worker = this.initWorker( '/assets/workers/openCv-face.js');
    console.log('initWorker');
    this.initCamera();
  }

  ngOnDestroy() {
    if (this.worker) {
      this.worker.terminate();
    }
    if (this.videoElement) {
      const video = this.videoElement.nativeElement;
      video.pause();
      if ((video as any).srcObject) {
        (video as any).srcObject.getVideoTracks()[0].stop();
      }
      video.srcObject = null;
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

  initCamera() {
    if (!this.src) {
      if (this.videoElement) {
        const video = this.videoElement.nativeElement;
        console.log('video');
        navigator.mediaDevices.getUserMedia({video: {width: {exact: 640}, height: {exact: 480}}, audio: false})
          .then(function(stream) {
            console.log('Camera Started');
            video.srcObject = stream;
            video.play();
            video.addEventListener('canplay', () => {
              console.log('canplay');
            }, false);
          })
          .catch(function(err) {
            console.error('Camera Error: ' + err.name + ' ' + err.message);
          });
      }
    }
  }

  getImageData(img = this.videoElement.nativeElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    canvas.width = 640/this.scaleRecognition;
    canvas.height = 480/this.scaleRecognition;

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

  addCoordinates(message: any) {
    this.coordinates = message.data.coordinates.map((item: any) => ({
      top: item.top + '%' ,
      left: item.left + '%',
      width: item.width + '%',
      height: item.height + '%',
    }));
    this.timeRecognition = performance.now() - this.startTimeRecognition;
    this.isRecognizing = false;

    this.store.dispatch(addCoordinates({recognitionData: message.data}));
  }

  recognizeAgain() {
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

  events(message: any) {
    // console.log(message);
    if (message.event === 'CLASSIFIER_LOADED') {
      this.isClassifierLoaded = true;
      this.sendImage();
      this.cdr.detectChanges();
    } else if (message.event === 'COORDINATES') {
      this.addCoordinates(message);
      this.cdr.detectChanges();
      this.recognizeAgain();
    }
  }
}
