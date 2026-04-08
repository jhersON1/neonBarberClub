import { Component, ChangeDetectionStrategy, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [],
  templateUrl: './services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesComponent implements OnInit {

  servicesList = [
    { id: 1, title: 'CORTE', details: 'Corte clásico o moderno con asesoría de imagen y acabado impecable.', price: 40, image: 'corte.webp' },
    { id: 2, title: 'BARBA Y CEJA', details: 'Diseño y perfilado con navaja, toallas calientes y productos premium.', price: 20, image: 'barba.webp' },
    { id: 3, title: 'LIMPIEZA FACIAL', details: 'Tratamiento con vaporizador, exfoliación y mascarilla para un cutis perfecto.', price: 35, image: 'corte2.webp' },
    { id: 4, title: 'COMBO VIP', details: 'La experiencia completa: Corte vanguardista, arreglo de barba y bebida de cortesía.', price: 70, image: 'corte2.webp' }
  ];

  servicePages: { index: number, items: any[] }[] = [];

  currentPage = 0;
  selectedServiceId: number | null = null;

  ngOnInit() {
    this.updatePagination();
  }

  selectService(id: number): void {
    this.selectedServiceId = this.selectedServiceId === id ? null : id;
  }

  @HostListener('window:resize')
  onResize() {
    this.updatePagination();
  }

  /**
   * Recalculates the pagination chunks based on window size to ensure responsiveness.
   */
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

    // Only update reference if length changes to help trigger change detection smoothly
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
