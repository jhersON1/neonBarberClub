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
    // Reemplazar la llamada directa a play() con una verificación de muted
    setTimeout(() => {
      this.tryPlayVideo(this.mobileVideo);
      this.tryPlayVideo(this.desktopVideo);
    }, 0);
  }
  
  private tryPlayVideo(videoRef: ElementRef<HTMLVideoElement>) {
    if (videoRef?.nativeElement) {
      // Asegurar que el video esté silenciado
      videoRef.nativeElement.muted = true;
      
      // Intenta reproducir el video
      const playPromise = videoRef.nativeElement.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Reproducción automática bloqueada:', error);
          // No mostrar error en consola, ya que es comportamiento esperado
        });
      }
    }
  }

}
