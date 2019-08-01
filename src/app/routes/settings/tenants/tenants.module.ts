import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { TenantsRoutingModule } from './tenants-routing.module';
import { TenantsListComponent } from './pages/list.component';

import { CreateTenantModalComponent } from './pages/create-tenant-modal.component';
import { EditTenantModalComponent } from './pages/edit-tenant-modal.component';

const COMPONENTS = [TenantsListComponent];
const COMPONENTS_NOROUNT = [CreateTenantModalComponent, EditTenantModalComponent];

@NgModule({
  imports: [SharedModule, TenantsRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class TenantsModule {}
