import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { BookingApiService } from '../../core/services/booking-api.service';
import { BarberService, CatalogItem } from '../../core/models';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [],
  templateUrl: './services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesComponent implements OnInit {
  private readonly bookingApi = inject(BookingApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');
  private previouslyFocusedElement?: HTMLElement;

  servicesList: BarberService[] = [];
  servicePages: { index: number; items: BarberService[] }[] = [];
  currentPage = 0;
  isLoading = false;
  loadError: string | null = null;

  isCatalogModalOpen = false;
  selectedCatalog: CatalogItem[] = [];
  selectedServiceTitle = '';
  currentCatalogIndex = 0;

  ngOnInit(): void {
    if (this.isBrowser) this.fetchServices();
  }

  fetchServices(forceRefresh = false): void {
    this.isLoading = true;
    this.loadError = null;
    this.bookingApi
      .getActiveServices(forceRefresh)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (data) => {
          this.servicesList = data.map((service) => ({
            ...service,
            mainImage: service.catalog?.[0]?.imgUrl ?? '',
          }));
          this.updatePagination();
        },
        error: () => {
          this.loadError = 'No pudimos cargar el catálogo de servicios.';
        },
      });
  }

  openCatalog(event: Event, service: BarberService): void {
    if (!service.catalog?.length) return;
    this.previouslyFocusedElement = event.currentTarget as HTMLElement;
    this.selectedCatalog = service.catalog;
    this.selectedServiceTitle = service.name;
    this.currentCatalogIndex = 0;
    this.isCatalogModalOpen = true;
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.closeButton()?.nativeElement.focus());
  }

  closeCatalog(): void {
    this.isCatalogModalOpen = false;
    this.selectedCatalog = [];
    document.body.style.overflow = '';
    this.previouslyFocusedElement?.focus();
  }

  nextCatalogImage(event?: Event): void {
    event?.stopPropagation();
    if (this.selectedCatalog.length > 0) {
      this.currentCatalogIndex = (this.currentCatalogIndex + 1) % this.selectedCatalog.length;
    }
  }

  prevCatalogImage(event?: Event): void {
    event?.stopPropagation();
    if (this.selectedCatalog.length > 0) {
      this.currentCatalogIndex =
        (this.currentCatalogIndex - 1 + this.selectedCatalog.length) % this.selectedCatalog.length;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isCatalogModalOpen) return;
    if (event.key === 'Escape') this.closeCatalog();
    if (event.key === 'ArrowRight') this.nextCatalogImage();
    if (event.key === 'ArrowLeft') this.prevCatalogImage();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updatePagination();
  }

  updatePagination(): void {
    const itemsPerPage = this.isBrowser && window.innerWidth < 640 ? 1 : 2;
    this.servicePages = [];
    for (let i = 0; i < this.servicesList.length; i += itemsPerPage) {
      this.servicePages.push({
        index: this.servicePages.length,
        items: this.servicesList.slice(i, i + itemsPerPage),
      });
    }
    if (this.currentPage >= this.servicePages.length) this.currentPage = 0;
  }

  nextPage(): void {
    if (this.servicePages.length > 1) {
      this.currentPage = (this.currentPage + 1) % this.servicePages.length;
    }
  }

  prevPage(): void {
    if (this.servicePages.length > 1) {
      this.currentPage = (this.currentPage - 1 + this.servicePages.length) % this.servicePages.length;
    }
  }

  goToPage(index: number): void {
    this.currentPage = index;
  }
}
