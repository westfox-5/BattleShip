import { Routes } from '@angular/router';
import { HomepageComponent } from '@comp/homepage/homepage.component';
import { LoginComponent } from '@comp/login/login.component';
import { GameComponent } from '@comp/game/game.component';
import { ProfileComponent } from '@comp/profile/profile.component';
import { AdminComponent } from '@comp/admin/admin.component';

export const AppRoutes: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', component: HomepageComponent},
    {path: 'login', component: LoginComponent},
    {path: 'game', component: GameComponent},
    {path: 'profile', component: ProfileComponent},
    {path: 'admin', component: AdminComponent}
];
