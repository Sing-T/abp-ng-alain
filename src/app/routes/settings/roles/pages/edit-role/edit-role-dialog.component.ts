import { Component, OnInit, Input, Injector } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';

import { RoleServiceProxy, RoleDto, ListResultDtoOfPermissionDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/app-component-base';

import * as _ from 'lodash';

@Component({
  selector: 'app-edit-role-dialog',
  templateUrl: './edit-role-dialog.component.html',
})
export class EditRoleDialogComponent extends AppComponentBase implements OnInit {
  permissions: ListResultDtoOfPermissionDto = null;
  role: RoleDto = null;
  saving = false;
  checkOptionsOne: Array<any> = [];

  @Input() roleId: number = null;

  constructor(injector: Injector, private _roleService: RoleServiceProxy, private subject: NzModalRef) {
    super(injector);

    this.role = new RoleDto();
    this.role.grantedPermissions = [];
    this.permissions = new ListResultDtoOfPermissionDto();
  }

  ngOnInit(): void {
    this._roleService.getAllPermissions()
      .subscribe((permissions: ListResultDtoOfPermissionDto) => {
        this.permissions = permissions;
        this.initPermissions(this.permissions);
      });

    this._roleService
      .get(this.roleId)
      .pipe(
        finalize(() => {
        }),
      )
      .subscribe((result: RoleDto) => {
        this.role = result;
        this.initPermissions(this.permissions);
      });
  }

  initPermissions(permissions: ListResultDtoOfPermissionDto): void {
    this.checkOptionsOne = _.map(permissions.items, c => {
      return {
        label: c.displayName,
        value: c.name,
        checked: this.checkPermission(c.name)
      };
    });
  }

  checkPermission(permissionName: string): boolean {
    if (this.role.grantedPermissions.indexOf(permissionName) !== -1) {
      return true;
    }
    else {
      return false;
    }
  }

  save(): void {
    this.saving = true;

    const selected = _.filter(this.checkOptionsOne, c => c.checked);
    const permissions = _.map(selected, 'value');
    this.role.grantedPermissions = permissions;

    this._roleService
      .update(this.role)
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
  close() {
    this.subject.destroy();
  }
}