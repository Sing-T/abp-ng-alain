import { Component, OnInit, Injector, Input } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { NzModalRef } from 'ng-zorro-antd';

import { UserServiceProxy, UserDto, RoleDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/app-component-base';

import * as _ from 'lodash';

@Component({
  selector: 'app-edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
})
export class EditUserDialogComponent extends AppComponentBase implements OnInit {
  user: UserDto = null;
  roles: RoleDto[] = null;
  saving = false;
  checkOptionsOne: Array<any> = [];

  @Input() userId: number = null;

  constructor(injector: Injector, private _userService: UserServiceProxy, private subject: NzModalRef) {
    super(injector);
    this.user = new UserDto();
  }

  ngOnInit() {
    this._userService.getRoles().subscribe(result => {
      this.roles = result.items;
      this.initRole(this.roles);
    });

    this._userService.get(this.userId).subscribe(result => {
      this.user = result;
      this.initRole(this.roles);
    });
  }

  initRole(roles: RoleDto[]): void {
    this.checkOptionsOne = _.map(roles, c => {
      return {
        label: c.displayName,
        value: c.normalizedName,
        checked: this.userInRole(c, this.user),
      };
    });
  }

  userInRole(role: RoleDto, user: UserDto): boolean {
    if (user.roleNames == null) {
      return false;
    }
    if (user.roleNames.indexOf(role.normalizedName) !== -1) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 保存操作
   */
  save(): void {
    this.saving = true;

    const roles = _.map(_.filter(this.checkOptionsOne, c => c.checked), 'value');
    this.user.roleNames = roles;

    this._userService
      .update(this.user)
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
