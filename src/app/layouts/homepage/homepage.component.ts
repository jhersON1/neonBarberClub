import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BookingComponent } from '../../components/booking/booking.component';
import { HeroVideoComponent } from '../../components/hero-video/hero-video.component';
import { LocationComponent } from '../../components/location/location.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ExperienceComponent } from '../../components/experience/experience.component';
import { ServicesComponent } from '../../components/services/services.component';

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
    BookingComponent,
    LocationComponent,
    FooterComponent
  ],
  templateUrl: './homepage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomepageComponent {

  /**
   * Smoothly scrolls the window to the specified section element, accounting
   * for the fixed navigation bar offset.
   *
   * @param sectionId - The DOM ID of the target section.
   */
  scrollToSection(sectionId: string): void {
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
