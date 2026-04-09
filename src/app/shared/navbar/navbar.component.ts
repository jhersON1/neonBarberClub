import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "w-full py-1.5 sm:py-2 md:py-3 lg:py-4 xl:py-5 bg-white/95 backdrop-blur-sm fixed top-0 z-50 border-b border-black/10 shadow-sm"
  }
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('nav')) {
      this.isMenuOpen = false;
    }
  }

  ngOnInit() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.isMenuOpen = false;
      });
  }

  scrollToSection(sectionId: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
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
