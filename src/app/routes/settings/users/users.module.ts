import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { UsersRoutingModule } from './users-routing.module';
import { UsersListComponent } from './pages/users.component';

import { CreateUserDialogComponent } from './pages/create-user/create-user-dialog.component';
import { EditUserDialogComponent } from './pages/edit-user/edit-user-dialog.component';

const COMPONENTS = [UsersListComponent];
const COMPONENTS_NOROUNT = [CreateUserDialogComponent, EditUserDialogComponent];

@NgModule({
  imports: [SharedModule, UsersRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class UsersModule {}
