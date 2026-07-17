import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BookingComponent } from '../../components/booking/booking.component';
import { HeroVideoComponent } from '../../components/hero-video/hero-video.component';
import { LocationComponent } from '../../components/location/location.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ExperienceComponent } from '../../components/experience/experience.component';
import { ServicesComponent } from '../../components/services/services.component';
import { LocalInfoComponent } from '../../components/local-info/local-info.component';
import { scrollToSection } from '../../shared/utils/scroll-to-section';

/**
 * Homepage component that serves as the main landing page for the application.
 * It integrates multiple child components (Hero, Experience, Services, Booking, Location, Footer).
 */
@Component({
  selector: 'app-homepage',
  imports: [
    NavbarComponent,
    HeroVideoComponent,
    ExperienceComponent,
    ServicesComponent,
    LocalInfoComponent,
    BookingComponent,
    LocationComponent,
    FooterComponent
  ],
  templateUrl: './homepage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomepageComponent {
  readonly scrollToSection = scrollToSection;
}
