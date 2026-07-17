import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BUSINESS_CONFIG, BUSINESS_LINKS } from '../../core/config/business.config';
import { scrollToSection } from '../utils/scroll-to-section';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8'
  }
})
export class FooterComponent {
  readonly business = BUSINESS_CONFIG;
  readonly links = BUSINESS_LINKS;
  readonly currentYear = new Date().getFullYear();
  readonly scrollToSection = scrollToSection;
}
