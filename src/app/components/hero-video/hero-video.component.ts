import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, PLATFORM_ID, ViewChild, signal } from '@angular/core';

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

  isMobile = signal(false);
  isDesktop = signal(false);
  isUltrawide = signal(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.detectScreenSize();
      
      setTimeout(() => {
        this.initializeVideo();
      }, 100);
    }
  }

  private detectScreenSize() {

    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      
      if (width < 768) {
        this.isMobile.set(true);
      } else if (width >= 768 && width < 1536) {
        this.isDesktop.set(true);
      } else {
        this.isUltrawide.set(true);
      }
    }
  }

  private initializeVideo() {
    
    if (this.videoElement?.nativeElement) {
      this.optimizeVideo(this.videoElement.nativeElement);
    } else {
      console.warn('Elemento video no encontrado, reintentando...');

      setTimeout(() => {
        if (this.videoElement?.nativeElement) {
          this.optimizeVideo(this.videoElement.nativeElement);
        } else {
          console.error('No se pudo encontrar el elemento video después de reintentar');
        }
      }, 200);
    }
  }

  private optimizeVideo(video: HTMLVideoElement) {

    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;
    video.preload = 'metadata';

    let hasPlayed = false;
    
    const deviceType = this.isMobile() ? 'móvil' : 
                      this.isDesktop() ? 'desktop' : 'ultrawide';

    const tryPlay = async () => {
      if (hasPlayed) return;
      
      try {
        await video.play();
        hasPlayed = true;

      } catch (error) {

        setTimeout(() => {
          if (!hasPlayed) {
            video.play().catch(e => console.warn('Segundo intento fallido:', e));
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
      console.error(`Error cargando video para ${deviceType}:`, e);
    });

    setTimeout(() => {
      if (!hasPlayed && video.paused) {
        console.log('Intento de respaldo para reproducir video...');
        tryPlay();
      }
    }, 2000);
  }


  private playVideo(video: HTMLVideoElement) {
    video.play().catch(error => {
      console.error('Video play failed:', error);
    });
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
