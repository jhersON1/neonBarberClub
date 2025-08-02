import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./layouts/homepage/homepage.component'),
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: ''
    }
];
