import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Inject,
  inject,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';

import { scrollToSection } from '../../shared/utils/scroll-to-section';

@Component({
  selector: 'app-hero-video',
  templateUrl: './hero-video.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative block w-full h-full',
  },
})
export class HeroVideoComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('videoElement') private videoElement?: ElementRef<HTMLVideoElement>;

  readonly videoFailed = signal(false);
  readonly scrollToSection = scrollToSection;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const video = this.videoElement?.nativeElement;
    if (!video) return;

    // Explicitly setting muted before play makes autoplay reliable after hydration.
    video.muted = true;
    const playVideo = () => void video.play().catch(() => {
      // Keep the video and its poster visible. A temporary autoplay rejection is
      // not a media failure and must not replace the hero with the fallback image.
    });

    playVideo();

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          playVideo();
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 },
    );
    visibilityObserver.observe(video);
    this.destroyRef.onDestroy(() => visibilityObserver.disconnect());
  }

  onVideoError(): void {
    this.videoFailed.set(true);
  }
}
