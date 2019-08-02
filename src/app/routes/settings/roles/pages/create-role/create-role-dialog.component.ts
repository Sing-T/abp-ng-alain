import { Component, OnInit, Injector } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { NzModalRef } from 'ng-zorro-antd';

import { RoleServiceProxy, CreateRoleDto, ListResultDtoOfPermissionDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/app-component-base';

import * as _ from 'lodash';

@Component({
  selector: 'app-create-role-dialog',
  templateUrl: './create-role-dialog.component.html',
})
export class CreateRoleDialogComponent extends AppComponentBase implements OnInit {
  permissions: ListResultDtoOfPermissionDto = null;
  role: CreateRoleDto = null;
  saving = false;
  checkOptionsOne: Array<any> = [];

  constructor(injector: Injector, private _roleService: RoleServiceProxy, private subject: NzModalRef) {
    super(injector);

    this.role = new CreateRoleDto();
    this.role.init({ isStatic: false });
    this.permissions = new ListResultDtoOfPermissionDto();
  }

  ngOnInit(): void {
    this._roleService.getAllPermissions()
      .subscribe((permissions: ListResultDtoOfPermissionDto) => {
        this.permissions = permissions;
        this.initPermissions(this.permissions);
      });
  }

  initPermissions(permissions: ListResultDtoOfPermissionDto): void {
    this.checkOptionsOne = _.map(permissions.items, c => {
      return {
        label: c.displayName,
        value: c.name,
        checked: true
      };
    });
  }

  save(): void {
    const selected = _.filter(this.checkOptionsOne, c => c.checked);
    const permissions = _.map(selected, 'value');

    this.role.grantedPermissions = permissions;

    this.saving = true;
    this._roleService.create(this.role)
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
      )
      .subscribe(() => {
        this.notify.info(this.l('SavedSuccessfully'));
        this.close();
      });
  }

  /**
   * 关闭弹出窗
   */
  close(): void {
    this.subject.destroy();
  }
}
