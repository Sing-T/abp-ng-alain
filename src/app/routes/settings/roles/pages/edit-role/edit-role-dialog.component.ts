import { Component, OnInit, Input, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';

import { AppComponentBase } from '@shared/app-component-base';
import { RoleServiceProxy, RoleDto, GetRoleForEditOutput, PermissionDto } from '@shared/service-proxies/service-proxies';

import * as _ from 'lodash';

@Component({
  selector: 'app-edit-role-dialog',
  templateUrl: './edit-role-dialog.component.html',
})
export class EditRoleDialogComponent extends AppComponentBase implements OnInit {
  saving = false;
  validateForm: FormGroup;
  role: RoleDto = new RoleDto();
  permissions: PermissionDto[] = [];
  checkOptions: Array<any> = [];

  @Input() roleId: number;

  constructor(
    private _fb: FormBuilder,
    private _subject: NzModalRef,
    private _roleService: RoleServiceProxy,
    injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.validateForm = this._fb.group({
      name: [null, [Validators.required]],
      displayName: [null, [Validators.required]],
      description: [true],
      grantedPermissions: [[]],
      id: [null]
    });

    if (this.roleId == null) {
      return;
    }

    this._roleService.getRoleForEdit(this.roleId).subscribe((result: GetRoleForEditOutput) => {
      this.role.init(result.role);
      this.role.grantedPermissions = result.grantedPermissionNames;
      this.validateForm.patchValue(this.role);

      _.map(result.permissions, item => {
        const permission = new PermissionDto();
        permission.init(item);
        this.permissions.push(permission);
      });
      this.initPermissions();
    });
  }

  initPermissions(): void {
    this.checkOptions = _.map(this.permissions, p => {
      return {
        label: p.displayName,
        value: p.name,
        checked: this.checkPermission(p.name)
      };
    });
  }

  checkPermission(permissionName: string): boolean {
    return _.includes(this.role.grantedPermissions, permissionName);
  }

  setPermissions(values: string[]): void {
    this.validateForm.controls.grantedPermissions.setValue(values);
  }

  save(): void {
    for (const i in this.validateForm.controls) {
      if (this.validateForm.controls.hasOwnProperty(i)) {
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
      }
    }
    if (!this.validateForm.valid) return;
    this.role.init(this.validateForm.value);

    this.saving = true;
    this._roleService.update(this.role)
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
      ).subscribe(() => {
        this.notify.info(this.l('SavedSuccessfully'));
        this.close();
      });
  }

  /**
   * 关闭弹出窗
   */
  close() {
    this._subject.destroy();
  }
}