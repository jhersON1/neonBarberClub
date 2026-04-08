import { ChangeDetectionStrategy, Component, ElementRef, viewChild, afterNextRender, HostListener, OnInit } from '@angular/core';
import { BookingComponent } from '../../components/booking/booking.component';
import { HeroVideoComponent } from '../../components/hero-video/hero-video.component';
import { LocationComponent } from '../../components/location/location.component';
import { FooterComponent } from '../../shared/footer/footer.component';


import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

gsap.registerPlugin(ScrollTrigger);

/**
 * Homepage component that serves as the main landing page for the application.
 * It integrates multiple child components (Hero, Services, Booking, Location, Footer)
 * and implements a complex, scroll-driven canvas animation using GSAP.
 */
@Component({
  selector: 'app-homepage',
  imports: [
    NavbarComponent,
    HeroVideoComponent,
    BookingComponent,
    LocationComponent,
    FooterComponent
  ],
  templateUrl: './homepage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomepageComponent implements OnInit {

  /** Reference to the container element driving the GSAP scroll animation. */
  scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');
  
  /** Reference to the canvas element where the animation frames are rendered. */
  frameCanvas = viewChild<ElementRef<HTMLCanvasElement>>('frameCanvas');
  
  /** Reference to the first overlay text element in the animation sequence. */
  text1 = viewChild<ElementRef<HTMLElement>>('text1');
  
  /** Reference to the second overlay text element in the animation sequence. */
  text3 = viewChild<ElementRef<HTMLElement>>('text3');

  /** Reference to the services carousel container to allow manual scrolling. */
  servicesCarousel = viewChild<ElementRef<HTMLElement>>('servicesCarousel');

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

  ngOnInit() {
    this.updatePagination();
  }

  /**
   * Preloads all animation frames and initializes the GSAP scroll triggers.
   * This logic is executed only in the browser context after the initial render.
   */
  private initPreloadAndGsap(): void {
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
   * Smoothly scrolls the window to the specified section element, accounting
   * for the fixed navigation bar offset.
   *
   * @param sectionId - The DOM ID of the target section.
   */
  scrollToSection(sectionId: string): void {
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

  servicesList = [
    { id: 1, title: 'CORTE', details: 'Corte clásico o moderno con asesoría de imagen y acabado impecable.', price: 40, image: 'corte.webp' },
    { id: 2, title: 'BARBA Y CEJA', details: 'Diseño y perfilado con navaja, toallas calientes y productos premium.', price: 20, image: 'barba.webp' },
    { id: 3, title: 'LIMPIEZA FACIAL', details: 'Tratamiento con vaporizador, exfoliación y mascarilla para un cutis perfecto.', price: 35, image: 'corte2.webp' },
    { id: 4, title: 'COMBO VIP', details: 'La experiencia completa: Corte vanguardista, arreglo de barba y bebida de cortesía.', price: 70, image: 'corte2.webp' }
  ];

  servicePages: { index: number, items: any[] }[] = [];

  currentPage = 0;
  selectedServiceId: number | null = null;

  selectService(id: number): void {
    this.selectedServiceId = this.selectedServiceId === id ? null : id;
  }

  @HostListener('window:resize')
  onResize() {
    this.updatePagination();
  }

  updatePagination(): void {
    let itemsPerPage = 2;
    if (typeof window !== 'undefined') {
      itemsPerPage = window.innerWidth < 640 ? 1 : 2;
    }
    
    const newPages = [];
    for (let i = 0; i < this.servicesList.length; i += itemsPerPage) {
      newPages.push({
        index: newPages.length,
        items: this.servicesList.slice(i, i + itemsPerPage)
      });
    }

    if (this.servicePages.length !== newPages.length) {
      this.servicePages = newPages;
      if (this.currentPage >= this.servicePages.length) {
        this.currentPage = 0;
      }
    }
  }

  nextPage(): void {
    this.currentPage = (this.currentPage + 1) % this.servicePages.length;
  }

  prevPage(): void {
    this.currentPage = (this.currentPage - 1 + this.servicePages.length) % this.servicePages.length;
  }

  goToPage(index: number): void {
    this.currentPage = index;
  }
}
