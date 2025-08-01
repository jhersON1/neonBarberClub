import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "w-full py-1.5 sm:py-2 md:py-3 lg:py-4 xl:py-5 bg-white/95 backdrop-blur-sm fixed top-0 z-50 border-b border-black/10 shadow-sm"
  }
})
export class NavbarComponent {
  isMenuOpen = false;
  router = inject(Router);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('nav')) {
      this.isMenuOpen = false;
    }
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isMenuOpen = false;
      }
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.isMenuOpen) {
      window.scrollTo(0, 0);
    }
  }

  scrollToSection(sectionId: string) {
    this.isMenuOpen = false;
    
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
