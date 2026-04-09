import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./layouts/homepage/homepage.component').then(m => m.HomepageComponent),
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: ''
    }
];
