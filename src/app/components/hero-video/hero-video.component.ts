import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';

@Component({
  selector: 'app-hero-video',
  imports: [],
  templateUrl: './hero-video.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative block w-full h-full'
  }
})
export class HeroVideoComponent implements AfterViewInit {
  @ViewChild('mobileVideo') mobileVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('desktopVideo') desktopVideo!: ElementRef<HTMLVideoElement>;

  constructor() { }

  ngAfterViewInit() {
    this.mobileVideo.nativeElement.muted = true;
    this.desktopVideo.nativeElement.muted = true;
    this.playVideo(this.mobileVideo);
    this.playVideo(this.desktopVideo);

  }

  private playVideo(videoRef: ElementRef<HTMLVideoElement>) {
    if (videoRef?.nativeElement) {
      videoRef.nativeElement.play().catch(error => {
        console.error('Video play failed:', error);
      });
    }
  }

}
