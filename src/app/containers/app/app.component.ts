import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {RectangleComponent} from '../../components/rectangle/rectangle.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {ImageRecognitionComponent} from '../image-recognition/image-recognition.component';
import {
  getSideMenu,
  isExternalCameraView,
  isImageView,
  isInternalCameraView,
  isVideoView
} from '../../+state/view/view.selectors';
import {Store} from '@ngrx/store';
import {IMenuItem} from '../../+state/view/view.reducer';
import {selectSideMenu} from '../../+state/view/view.actions';

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
      ImageRecognitionComponent,
    ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  // src = 'http://192.168.20.135:8080/video';
  src = 'assets/images/faces.jpeg';


  getSideMenu$ = this.store.select(getSideMenu);
  isImageView$ = this.store.select(isImageView);
  isInternalCameraView$ = this.store.select(isInternalCameraView);
  isExternalCameraView$ = this.store.select(isExternalCameraView);
  isVideoView$ = this.store.select(isVideoView);

  constructor(private readonly store: Store) { }

  selectMenu(menuItem: IMenuItem) {
    this.store.dispatch(selectSideMenu({menuItem}));
  }

  protected readonly isInternalCameraView = isInternalCameraView;
}
