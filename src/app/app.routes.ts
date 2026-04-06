import { Routes } from '@angular/router';
import { HomepageComponent } from './layouts/homepage/homepage.component';

export const routes: Routes = [
    {
        path: '',
        component: HomepageComponent,
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: ''
    }
];
