import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8'
  }
})
export class FooterComponent {

}
