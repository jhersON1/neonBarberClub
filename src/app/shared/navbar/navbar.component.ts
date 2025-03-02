import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "w-full py-1.5 sm:py-2 md:py-3 bg-white/95 backdrop-blur-sm fixed top-0 z-50 border-b border-black/10 shadow-sm" 
  }
})
export class NavbarComponent {
  isMenuOpen = false;
  router = inject(Router);

  // Cerrar menú al hacer click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('nav')) {
      this.isMenuOpen = false;
    }
  }

  // Cerrar menú al cambiar de ruta
  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isMenuOpen = false;
      }
    });
  }

  // Prevenir scroll cuando el menú está abierto
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.isMenuOpen) {
      window.scrollTo(0, 0);
    }
  }
}
