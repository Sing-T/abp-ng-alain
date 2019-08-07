import { Component, OnInit, Input, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';

import { AppComponentBase } from '@shared/app-component-base';
import { UserServiceProxy, UserDto, RoleDto } from '@shared/service-proxies/service-proxies';

import * as _ from 'lodash';

@Component({
  selector: 'app-edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
})
export class EditUserDialogComponent extends AppComponentBase implements OnInit {
  saving = false;
  validateForm: FormGroup;
  user: UserDto = new UserDto();
  roles: RoleDto[] = [];
  checkOptions: Array<any> = [];

  @Input() userId: number = null;

  constructor(
    private _fb: FormBuilder,
    private _subject: NzModalRef,
    private _userService: UserServiceProxy,
    injector: Injector
  ) {
    super(injector);
  }

  emailAddressValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{1,})+$/.test(control.value)) {
      return { regExp: true, error: true };
    }
    return {};
  };

  ngOnInit() {
    this.validateForm = this._fb.group({
      userName: [null, [Validators.required]],
      name: [null, [Validators.required]],
      surname: [null, [Validators.required]],
      emailAddress: [null, [Validators.required, this.emailAddressValidator]],
      isActive: [true],
      roleNames: [[]],
      id: [null]
    });

    if (this.userId == null) {
      return;
    }

    this._userService.get(this.userId).subscribe(result => {
      this.user = result;
      this.validateForm.patchValue(this.user);

      this._userService.getRoles().subscribe(res => {
        this.roles = res.items;
        this.initRoles();
      });
    });
  }

  initRoles(): void {
    this.checkOptions = _.map(this.roles, r => {
      return {
        label: r.displayName,
        value: r.normalizedName,
        checked: this.isRoleChecked(r.normalizedName),
      };
    });
  }

  isRoleChecked(normalizedName: string): boolean {
    return _.includes(this.user.roleNames, normalizedName);
  }

  setRoles(values: string[]): void {
    this.validateForm.controls.roleNames.setValue(values);
  }

  /**
   * 保存操作
   */
  save(): void {
    for (const i in this.validateForm.controls) {
      if (this.validateForm.controls.hasOwnProperty(i)) {
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
      }
    }
    if (!this.validateForm.valid) return;
    this.user.init(this.validateForm.value);

    this.saving = true;
    this._userService.update(this.user)
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
      ).subscribe(res => {
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
