import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BookingComponent } from '../../components/booking/booking.component';
import { HeroVideoComponent } from '../../components/hero-video/hero-video.component';
import { LocationComponent } from '../../components/location/location.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-homepage',
  imports: [
    NavbarComponent,
    HeroVideoComponent,
    BookingComponent,
    LocationComponent,
    FooterComponent
  ],
  templateUrl: './homepage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class HomepageComponent {

}
