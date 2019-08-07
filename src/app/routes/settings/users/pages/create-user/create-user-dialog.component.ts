import { Component, OnInit, Injector } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';

import { AppComponentBase } from '@shared/app-component-base';
import { UserServiceProxy, CreateUserDto, RoleDto } from '@shared/service-proxies/service-proxies';

import * as _ from 'lodash';

@Component({
  selector: 'app-create-user-dialog',
  templateUrl: './create-user-dialog.component.html',
})
export class CreateUserDialogComponent extends AppComponentBase implements OnInit {
  saving = false;
  validateForm: FormGroup;
  user: CreateUserDto = new CreateUserDto();
  roles: RoleDto[] = [];
  checkOptions: Array<any> = [];

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

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() => this.validateForm.controls.confirmPassword.updateValueAndValidity());
  }

  ngOnInit() {
    this.validateForm = this._fb.group({
      userName: [null, [Validators.required]],
      name: [null, [Validators.required]],
      surname: [null, [Validators.required]],
      emailAddress: [null, [Validators.required, this.emailAddressValidator]],
      password: [null, [Validators.required]],
      confirmPassword: [null, [Validators.required, this.confirmationValidator]],
      isActive: [true],
      roleNames: [[]]
    });

    this._userService.getRoles().subscribe(result => {
      this.roles = result.items;
      this.initRoles();
    });
  }

  initRoles(): void {
    this.checkOptions = _.map(this.roles, r => {
      return {
        label: r.displayName,
        value: r.normalizedName,
        checked: false
      };
    });
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
    this._userService.create(this.user)
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
