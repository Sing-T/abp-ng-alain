import { Component, OnInit, Injector } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';

import { UserServiceProxy, CreateUserDto, RoleDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/app-component-base';

import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-create-user-dialog',
  templateUrl: './create-user-dialog.component.html',
})
export class CreateUserDialogComponent extends AppComponentBase implements OnInit {
  user: CreateUserDto = null;
  roles: RoleDto[] = null;
  saving = false;
  checkOptionsOne: Array<any> = [];

  constructor(injector: Injector, private _userService: UserServiceProxy, private subject: NzModalRef) {
    super(injector);
  }

  ngOnInit() {
    this._userService.getRoles().subscribe(result => {
      this.roles = result.items;
      this.initRole(this.roles);
    });

    this.user = new CreateUserDto();
    this.user.init({ isActive: true });

    this.checkOptionsOne = [];
  }

  initRole(roles: RoleDto[]): void {
    this.checkOptionsOne = _.map(roles, c => {
      return {
        label: c.displayName,
        value: c.normalizedName,
      };
    });
  }

  /**
   * 保存操作
   */
  save(): void {
    this.saving = true;

    const selectRoles = _.filter(this.checkOptionsOne, c => c.checked);
    const roles = _.map(selectRoles, 'value');

    this.user.roleNames = roles;

    this._userService
      .create(this.user)
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
      )
      .subscribe(res => {
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
