import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BUSINESS_CONFIG, BUSINESS_LINKS } from '../../core/config/business.config';

@Component({
  selector: 'app-location',
  imports: [],
  templateUrl: './location.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8'
  }
})
export class LocationComponent {
  readonly business = BUSINESS_CONFIG;
  readonly links = BUSINESS_LINKS;
  readonly mapUrl: SafeResourceUrl;
  
  constructor(private sanitizer: DomSanitizer) {

    const lat = this.business.coordinates.latitude;
    const lng = this.business.coordinates.longitude;
    
    const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.005},${lat-0.005},${lng+0.005},${lat+0.005}&layer=mapnik&marker=${lat},${lng}`;
    
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(osmUrl);
  }
}
