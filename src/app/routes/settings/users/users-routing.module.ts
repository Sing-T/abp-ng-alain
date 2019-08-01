import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersListComponent } from './pages/users.component';
import { AppRouteGuard } from '@shared/auth/auth-route-guard';

const routes: Routes = [{ path: '', component: UsersListComponent, canActivate: [AppRouteGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
