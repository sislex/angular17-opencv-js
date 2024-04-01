import {
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
import { addCoordinates } from '../../+state/targets/targets.actions';
import {getCoordinatesStyles, getOverageRecognitionTime} from '../../+state/targets/targets.selectors';
import {RecognitionWorkerService} from '../../services/recognition-worker.service';
import {getImageData} from '../../halpers/images-utils';
import {getIntervalTime} from '../../halpers/coordinates-utils';

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
export class ImageRecognitionComponent  implements OnDestroy {
  @ViewChild('image', { static: false }) imageElement!: ElementRef<HTMLImageElement>;
  @ViewChild('video', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  getSelectedSideMenuItem$ = this.store.select(getSelectedSideMenuItem).pipe(take(1));
  getOverageRecognitionTime$ = this.store.select(getOverageRecognitionTime);
  getCoordinatesStyles$ = this.store.select(getCoordinatesStyles);

  isImageLoaded = false;
  workerIsReady = false;

  isRecognizing = false;

  // video only
  isVideo = false;
  recognitionInterval = 0;

  constructor(
    private readonly store: Store,
    private readonly recognitionWorkerService: RecognitionWorkerService,
    private readonly cdr:  ChangeDetectorRef,
  ) {
    this.getSelectedSideMenuItem$.subscribe((selectedItem) => {
      if (selectedItem) {

        this.isVideo = selectedItem.data.isVideo;
        this.recognitionInterval = selectedItem.data.recognitionInterval;
      }
    });

    this.recognitionWorkerService.isWorkerReady$.subscribe((isReady) => {
      this.workerIsReady = isReady;
      this.sendImage();
    });

    this.recognitionWorkerService.getWorkerMessages().subscribe((message) => {
      console.log('message', message);
      this.events(message);
    });
  }

  ngOnDestroy() {
    if (this.imageElement && this.imageElement.nativeElement) {
      // Очистка источника изображения
      this.imageElement.nativeElement.src = '';
    }
  }

  sendImage() {
    if (this.isImageLoaded && this.workerIsReady) {
      this.isRecognizing = true;
      const size:  {width: number, height: number} = {
        width:  this.imageElement.nativeElement.naturalWidth/4.5,
        height: this.imageElement.nativeElement.naturalHeight/4.5,
      };
      const imageData = getImageData(this.imageElement.nativeElement, size);
      this.recognitionWorkerService.sendMessage({
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
    if (!this.isRecognizing) {
      this.sendImage();
    }
  }

  events(message: any) {
    // console.log(message);
     if (message.event === 'COORDINATES') {
      this.isRecognizing = false;
      this.store.dispatch(addCoordinates({recognitionData: message.data}));
      this.cdr.detectChanges();

      if (this.isVideo) {
        setTimeout(() => {
          this.sendImage();
        }, getIntervalTime(message.data.recognitionTime,  this.recognitionInterval));
      }
    }
  }
}
