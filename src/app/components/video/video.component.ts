import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'video-component',
  standalone: true,
  templateUrl: './video.component.html',
  imports: [],
  styleUrls: ['./video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoComponent {
  @Input() src: string = '';
}
