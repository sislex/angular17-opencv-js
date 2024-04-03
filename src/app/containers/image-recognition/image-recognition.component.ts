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
import {AsyncPipe, JsonPipe} from '@angular/common';
import {Subject, take, takeUntil} from 'rxjs';
import { addCoordinates } from '../../+state/targets/targets.actions';
import {
  getCoordinatesStyles,
  getOverageRecognitionTime,
  getTheDistanceToTheCenterOfTheNearestTarget
} from '../../+state/targets/targets.selectors';
import {RecognitionWorkerService} from '../../services/recognition-worker.service';
import {getImageData} from '../../halpers/images-utils';
import {getIntervalTime} from '../../halpers/coordinates-utils';
import {destroyCamera, initCamera} from '../../halpers/camera-utils';

@Component({
  selector: 'app-image-recognition',
  standalone: true,
  imports: [
    RectangleComponent,
    AsyncPipe,
    JsonPipe
  ],
  templateUrl: './image-recognition.component.html',
  styleUrl: './image-recognition.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageRecognitionComponent  implements OnDestroy, AfterViewInit {
  @ViewChild('content', { static: false }) contentElement!: ElementRef<HTMLVideoElement>;

  getSelectedSideMenuItem$ = this.store.select(getSelectedSideMenuItem).pipe(take(1));
  getOverageRecognitionTime$ = this.store.select(getOverageRecognitionTime);
  getCoordinatesStyles$ = this.store.select(getCoordinatesStyles);
  getTheDistanceToTheCenterOfTheNearestTarget$ = this.store.select(getTheDistanceToTheCenterOfTheNearestTarget);

  private destroy$ = new Subject<void>();

  isContentReady = false;
  private workerIsReady = false;

  private isRecognizing = false;

  private cameraSize: {width: number, height: number} = {
    width:  320,
    height: 240,
  }

  constructor(
    private readonly store: Store,
    private readonly recognitionWorkerService: RecognitionWorkerService,
    private readonly cdr:  ChangeDetectorRef,
  ) {
    this.recognitionWorkerService.isWorkerReady$.pipe(takeUntil(this.destroy$)).subscribe((isReady) => {
      this.workerIsReady = isReady;
      this.sendImage();
    });

    this.recognitionWorkerService.getWorkerMessages().pipe(takeUntil(this.destroy$)).subscribe((message) => {
      this.events(message);
    });
  }

  ngAfterViewInit() {
    this.getSelectedSideMenuItem$.pipe(take(1)).subscribe((selectedItem) => {
      if (selectedItem?.data.isCamera) {
        initCamera(this.contentElement.nativeElement);
      }
    });
  }

  ngOnDestroy() {
    if (this.contentElement && this.contentElement.nativeElement) {
      this.isContentReady = false;
      const contentElement = this.contentElement.nativeElement;
      contentElement.src = '';
      destroyCamera(contentElement);
      // this.getSelectedSideMenuItem$.pipe(take(1)).subscribe((selectedItem) => {
      //   if (selectedItem?.data.isCamera) {
      //     // Остановка камеры
      //
      //   } else {
      //     // Очистка источника изображения
      //
      //   }
      // });

    }
    this.destroy$.next();
  }

  sendImage() {
    if (this.isContentReady && this.workerIsReady) {
      this.isRecognizing = true;

      const element: any = this.contentElement.nativeElement;
      let size: {width: number, height: number} = this.cameraSize;

      if (element.naturalWidth) { // if image
        size = {
          width:  element.naturalWidth/4.5,
          height: element.naturalHeight/4.5,
        };
      }

      const imageData = getImageData(this.contentElement.nativeElement, size);
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

  contentReady() {
    this.isContentReady = true;
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

       this.getSelectedSideMenuItem$.pipe(take(1)).subscribe((selectedItem) => {
         const recognitionInterval = selectedItem?.data.recognitionInterval;

         if (recognitionInterval > 0) {
           setTimeout(() => {
             this.sendImage();
           }, getIntervalTime(message.data.recognitionTime,  recognitionInterval));
         }
       });
    }
  }
}
