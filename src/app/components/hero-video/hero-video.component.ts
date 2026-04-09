import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';

@Component({
  selector: 'app-hero-video',
  templateUrl: './hero-video.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative block w-full h-full'
  }
})
export class HeroVideoComponent implements AfterViewInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeVideo();
      }, 100);
    }
  }

  private initializeVideo() {
    if (this.videoElement?.nativeElement) {
      this.optimizeVideo(this.videoElement.nativeElement);
    } else {
      console.warn('Video element not found, retrying...');

      setTimeout(() => {
        if (this.videoElement?.nativeElement) {
          this.optimizeVideo(this.videoElement.nativeElement);
        } else {
          console.error('Could not find video element after retry');
        }
      }, 200);
    }
  }

  private optimizeVideo(video: HTMLVideoElement) {
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;
    video.preload = 'auto';

    let hasPlayed = false;

    const tryPlay = async () => {
      if (hasPlayed) return;
      
      try {
        await video.play();
        hasPlayed = true;
      } catch (error) {
        setTimeout(() => {
          if (!hasPlayed) {
            video.play().catch(e => console.warn('Second play attempt failed:', e));
          }
        }, 1000);
      }
    };

    video.addEventListener('loadedmetadata', tryPlay, { once: true });
    video.addEventListener('loadeddata', tryPlay, { once: true });
    video.addEventListener('canplay', tryPlay, { once: true });
    
    if (video.readyState >= 3) {
      tryPlay();
    }
    
    video.addEventListener('error', (e) => {
      console.error('Error loading hero video:', e);
    });

    setTimeout(() => {
      if (!hasPlayed && video.paused) {
        tryPlay();
      }
    }, 2000);
  }

  onVideoError(event: Event) {
    const video = event.target as HTMLVideoElement;
    console.error('Video error occurred:', event);

    if (!video.dataset['retried']) {
      video.dataset['retried'] = 'true';
      video.load();
    }
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
