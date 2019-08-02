import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { RolesRoutingModule } from './roles-routing.module';
import { RolesListComponent } from './pages/roles.component';

import { CreateRoleDialogComponent } from './pages/create-role/create-role-dialog.component';
import { EditRoleDialogComponent } from './pages/edit-role/edit-role-dialog.component';

const COMPONENTS = [RolesListComponent];
const COMPONENTS_NOROUNT = [CreateRoleDialogComponent, EditRoleDialogComponent];

@NgModule({
  imports: [SharedModule, RolesRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class RolesModule { }
