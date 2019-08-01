import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { TenantsRoutingModule } from './tenants-routing.module';
import { TenantsListComponent } from './pages/tenants.component';

import { CreateTenantDialogComponent } from './pages/create-tenant/create-tenant-dialog.component';
import { EditTenantDialogComponent } from './pages/edit-tenant/edit-tenant-dialog.component';

const COMPONENTS = [TenantsListComponent];
const COMPONENTS_NOROUNT = [CreateTenantDialogComponent, EditTenantDialogComponent];

@NgModule({
  imports: [SharedModule, TenantsRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class TenantsModule {}
