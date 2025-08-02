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
  @ViewChild('ultrawideVideo') ultrawideVideo!: ElementRef<HTMLVideoElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeVideos();
    }
  }

  private initializeVideos() {

    if (this.mobileVideo?.nativeElement) {
      this.optimizeVideo(this.mobileVideo.nativeElement);
    }
    if (this.desktopVideo?.nativeElement) {
      this.optimizeVideo(this.desktopVideo.nativeElement);
    }
    if (this.ultrawideVideo?.nativeElement) {
      this.optimizeVideo(this.ultrawideVideo.nativeElement);
    }
  }

  private optimizeVideo(video: HTMLVideoElement) {
    video.muted = true;
    video.playsInline = true;
    
    video.load();
    
    video.addEventListener('loadeddata', () => {
      this.playVideo(video);
    });

    video.addEventListener('error', (e) => {
      console.error('Error loading video:', e);
    });
  }

  private playVideo(video: HTMLVideoElement) {
    video.play().catch(error => {
      console.error('Video play failed:', error);
    });
  }

  scrollToSection(sectionId: string) {
    const targetElement = document.getElementById(sectionId);

    if (targetElement) {
      const navbarHeight = 80;
      const elementPosition = targetElement.offsetTop - navbarHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  }
}
