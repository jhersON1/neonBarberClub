import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  mapUrl: SafeResourceUrl;
  
  constructor(private sanitizer: DomSanitizer) {

    const lat = -17.828305;
    const lng = -63.137408;
    
    const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.005},${lat-0.005},${lng+0.005},${lat+0.005}&layer=mapnik&marker=${lat},${lng}`;
    
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(osmUrl);
  }

  openDirections(): void {
    const mapsUrl = 'https://www.google.com/maps/place/Neon+Barber+club/@-17.8282554,-63.1371069,19.83z/data=!4m6!3m5!1s0x93f1e7f18fac57d3:0x5f221055256b4872!8m2!3d-17.8282691!4d-63.1373726!16s%2Fg%2F11lv2gk8_q?entry=ttu&g_ep=EgoyMDI1MDcyOC4wIKXMDSoASAFQAw%3D%3D';
    window.open(mapsUrl, '_blank');
  }
}
