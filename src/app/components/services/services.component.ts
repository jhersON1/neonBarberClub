import { Component, ChangeDetectionStrategy, HostListener, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { BookingApiService } from '../../core/services/booking-api.service';
import { BarberService, CatalogItem } from '../../core/models';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [], // Signals & Control flow means we don't need CommonModule usually if Angular 17+
  templateUrl: './services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesComponent implements OnInit {
  private readonly bookingApi = inject(BookingApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  servicesList: BarberService[] = [];
  servicePages: { index: number, items: BarberService[] }[] = [];

  currentPage = 0;
  selectedServiceId: string | null = null; // id from firestore is string

  // Modal State
  isCatalogModalOpen = false;
  selectedCatalog: CatalogItem[] = [];
  selectedServiceTitle = '';
  currentCatalogIndex = 0;

  ngOnInit() {
    this.fetchServices();
  }

  fetchServices() {
    this.bookingApi.getActiveServices()
      .subscribe({
        next: (data) => {
          this.servicesList = data.map(service => ({
            ...service,
            mainImage: service.catalog && service.catalog.length > 0 && service.catalog[0].imgUrl 
                       ? service.catalog[0].imgUrl 
                       : ''
          }));
          this.updatePagination();
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error fetching services', err)
      });
  }

  selectService(id: string): void {
    this.selectedServiceId = this.selectedServiceId === id ? null : id;
  }

  openCatalog(event: Event, service: BarberService): void {
    event.stopPropagation();
    if (service.catalog && service.catalog.length > 0) {
      this.selectedCatalog = service.catalog;
      this.selectedServiceTitle = service.name;
      this.isCatalogModalOpen = true;
      this.currentCatalogIndex = 0;

      if (typeof window !== 'undefined') document.body.style.overflow = 'hidden';
    }
  }

  closeCatalog(): void {
    this.isCatalogModalOpen = false;
    this.selectedCatalog = [];
    if (typeof window !== 'undefined') document.body.style.overflow = '';
  }

  nextCatalogImage(event: Event): void {
    event.stopPropagation();
    if (this.currentCatalogIndex < this.selectedCatalog.length - 1) {
      this.currentCatalogIndex++;
    } else {
      this.currentCatalogIndex = 0;
    }
  }

  prevCatalogImage(event: Event): void {
    event.stopPropagation();
    if (this.currentCatalogIndex > 0) {
      this.currentCatalogIndex--;
    } else {
      this.currentCatalogIndex = this.selectedCatalog.length - 1;
    }
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
    // With dynamic data we might always want to update it initially
    this.servicePages = newPages;
    if (this.currentPage >= this.servicePages.length && this.servicePages.length > 0) {
      this.currentPage = 0;
    }
  }

  nextPage(): void {
    if (this.servicePages.length === 0) return;
    this.currentPage = (this.currentPage + 1) % this.servicePages.length;
  }

  prevPage(): void {
    if (this.servicePages.length === 0) return;
    this.currentPage = (this.currentPage - 1 + this.servicePages.length) % this.servicePages.length;
  }

  goToPage(index: number): void {
    this.currentPage = index;
  }
}
