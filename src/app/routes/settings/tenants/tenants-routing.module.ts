import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TenantsListComponent } from './pages/tenants.component';
import { AppRouteGuard } from '@shared/auth/auth-route-guard';

const routes: Routes = [{ path: '', component: TenantsListComponent, canActivate: [AppRouteGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TenantsRoutingModule {}
