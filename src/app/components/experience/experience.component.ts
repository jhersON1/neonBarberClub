import { Component, ChangeDetectionStrategy, ElementRef, viewChild, afterNextRender, output } from '@angular/core';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [],
  templateUrl: './experience.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperienceComponent {

  scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');

  frameCanvas = viewChild<ElementRef<HTMLCanvasElement>>('frameCanvas');
  
  /** Reference to the first overlay text element in the animation sequence. */
  text1 = viewChild<ElementRef<HTMLElement>>('text1');
  
  /** Reference to the second overlay text element in the animation sequence. */
  text3 = viewChild<ElementRef<HTMLElement>>('text3');

  /** Event emitter mapped to the 'RESERVAR AHORA' button click */
  scrollTo = output<string>();

  /** Total number of frames available for the animation sequence. */
  private readonly frameCount = 120;
  
  /** Object tracking the current frame index, updated by GSAP during scroll. */
  private currentFrame = { frame: 0 };
  
  /** Array holding the preloaded HTML image elements. */
  private images: HTMLImageElement[] = [];

  constructor() {
    afterNextRender(() => {
      this.initPreloadAndGsap();
    });
  }

  /**
   * Preloads all animation frames and initializes the GSAP scroll triggers.
   * GSAP is dynamically imported to avoid adding ~200KB to the initial bundle.
   * This logic is executed only in the browser context after the initial render.
   */
  private async initPreloadAndGsap(): Promise<void> {
    for (let i = 1; i <= this.frameCount; i++) {
      const img = new Image();
      const frameNum = i.toString().padStart(3, '0');
      img.src = `machineFrames/fotograma_${frameNum}.webp`;
      this.images.push(img);
    }

    const canvas = this.frameCanvas()?.nativeElement;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;

    this.images[0].onload = () => {
      canvas.width = this.images[0].width;
      canvas.height = this.images[0].height;
      this.renderFrame(context, canvas);
    };

    const container = this.scrollContainer()?.nativeElement;
    const t1 = this.text1()?.nativeElement;
    const t3 = this.text3()?.nativeElement;

    if (!container || !t1 || !t3) return;

    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 75%',
        end: 'bottom top',
        scrub: 1,
      }
    });

    tl.to(this.currentFrame, {
      frame: this.frameCount - 1,
      snap: 'frame',
      ease: 'none',
      duration: 1,
      onUpdate: () => this.renderFrame(context, canvas)
    }, 0);

    tl.to(t1, { opacity: 1, y: -20, duration: 0.1, ease: 'power1.out' }, 0.20);
    tl.to(t1, { opacity: 0, y: -40, duration: 0.1, ease: 'power1.in' }, 0.40);

    tl.to(t3, { opacity: 1, y: -20, duration: 0.1, ease: 'power1.out' }, 0.45);
  }

  /**
   * Clears the canvas and draws the image corresponding to the current frame.
   *
   * @param context - The 2D rendering context of the canvas.
   * @param canvas - The HTML canvas element being drawn upon.
   */
  private renderFrame(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const frameIndex = Math.round(this.currentFrame.frame);
    const img = this.images[frameIndex];
    if (img && img.complete) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }

  /**
   * Triggered by the template to emit the scroll action to the parent component.
   */
  onReserveClick(): void {
    this.scrollTo.emit('reservar');
  }
}
