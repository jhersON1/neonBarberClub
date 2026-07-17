import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [],
  templateUrl: './experience.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');
  readonly frameCanvas = viewChild<ElementRef<HTMLCanvasElement>>('frameCanvas');
  readonly text1 = viewChild<ElementRef<HTMLElement>>('text1');
  readonly text3 = viewChild<ElementRef<HTMLElement>>('text3');
  readonly scrollTo = output<string>();

  private readonly frameCount = 120;
  private readonly currentFrame = { frame: 0 };
  private readonly images: Array<HTMLImageElement | undefined> = new Array(this.frameCount);
  private destroyed = false;

  constructor() {
    this.destroyRef.onDestroy(() => (this.destroyed = true));
    afterNextRender(() => void this.initializeAnimation());
  }

  private async initializeAnimation(): Promise<void> {
    const canvas = this.frameCanvas()?.nativeElement;
    const container = this.scrollContainer()?.nativeElement;
    const primaryCopy = this.text1()?.nativeElement;
    const secondaryCopy = this.text3()?.nativeElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !container || !primaryCopy || !secondaryCopy) return;

    const firstImage = await this.loadFrame(0);
    if (!firstImage || this.destroyed) return;

    canvas.width = firstImage.naturalWidth;
    canvas.height = firstImage.naturalHeight;
    this.renderFrame(context, canvas);

    // Restore the complete sequence. Loading begins as soon as the section is
    // instantiated so scrolling never advances through deliberately missing frames.
    for (let index = 1; index < this.frameCount; index++) {
      void this.loadFrame(index);
    }

    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    if (this.destroyed) return;

    gsap.registerPlugin(ScrollTrigger);
    gsap.set(primaryCopy, { opacity: 1, y: 0 });
    gsap.set(secondaryCopy, { opacity: 0, y: 0 });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    timeline.to(
      this.currentFrame,
      {
        frame: this.frameCount - 1,
        snap: 'frame',
        ease: 'none',
        duration: 1,
        onUpdate: () => this.renderFrame(context, canvas),
      },
      0,
    );
    timeline.to(primaryCopy, { opacity: 0, y: -40, duration: 0.1 }, 0.38);
    timeline.to(secondaryCopy, { opacity: 1, y: -20, duration: 0.1 }, 0.43);

    ScrollTrigger.refresh();
    this.destroyRef.onDestroy(() => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    });
  }

  private loadFrame(index: number): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const image = new Image();
      const frameNumber = (index + 1).toString().padStart(3, '0');
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      this.images[index] = image;
      image.src = `machineFrames/fotograma_${frameNumber}.webp`;
    });
  }

  private renderFrame(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const requestedIndex = Math.round(this.currentFrame.frame);
    let image = this.images[requestedIndex];

    for (
      let distance = 1;
      (!image || !image.complete || image.naturalWidth === 0) && distance < this.frameCount;
      distance++
    ) {
      image = this.images[requestedIndex - distance] ?? this.images[requestedIndex + distance];
    }

    if (!image?.complete || image.naturalWidth === 0) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  }

  onReserveClick(): void {
    this.scrollTo.emit('reservar');
  }
}
