import { Component, OnInit, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';

import { AppComponentBase } from '@shared/app-component-base';
import { RoleServiceProxy, CreateRoleDto, ListResultDtoOfPermissionDto } from '@shared/service-proxies/service-proxies';

import * as _ from 'lodash';

@Component({
  selector: 'app-create-role-dialog',
  templateUrl: './create-role-dialog.component.html',
})
export class CreateRoleDialogComponent extends AppComponentBase implements OnInit {
  saving = false;
  validateForm: FormGroup;
  role: CreateRoleDto = new CreateRoleDto();
  permissions: ListResultDtoOfPermissionDto = new ListResultDtoOfPermissionDto();
  checkOptions: Array<any> = [];

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
      description: [null],
      grantedPermissions: [[]]
    });

    this._roleService.getAllPermissions()
      .subscribe((permissions: ListResultDtoOfPermissionDto) => {
        this.permissions = permissions;
        this.initPermissions(this.permissions);
      });
  }

  initPermissions(permissions: ListResultDtoOfPermissionDto): void {
    this.checkOptions = _.map(permissions.items, p => {
      return {
        label: p.displayName,
        value: p.name,
        checked: false
      };
    });
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
    this._roleService.create(this.role)
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
  close(): void {
    this._subject.destroy();
  }
}
