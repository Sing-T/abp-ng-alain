import { Component, OnInit, Injector } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { AppComponentBase } from '@shared/app-component-base';
import { TenantServiceProxy, CreateTenantDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-create-tenant-dialog',
  templateUrl: './create-tenant-dialog.component.html',
})
export class CreateTenantDialogComponent extends AppComponentBase implements OnInit {
  saving = false;
  validateForm: FormGroup;
  tenant: CreateTenantDto = new CreateTenantDto();

  constructor(
    private _fb: FormBuilder,
    private _subject: NzModalRef,
    private _tenantService: TenantServiceProxy,
    injector: Injector
  ) {
    super(injector);
  }

  tenancyNameValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (!/^[a-zA-Z][a-zA-Z0-9_-]{1,}$/.test(control.value)) {
      return { regExp: true, error: true };
    }
    return {};
  };

  adminEmailAddressValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{1,})+$/.test(control.value)) {
      return { regExp: true, error: true };
    }
    return {};
  };

  ngOnInit(): void {
    this.tenant.isActive = true;

    this.validateForm = this._fb.group({
      tenancyName: [null, [Validators.required, this.tenancyNameValidator]],
      name: [null, [Validators.required]],
      databaseConnectionString: [null],
      adminEmailAddress: [null, [Validators.required, this.adminEmailAddressValidator]],
      isActive: [true]
    });
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
    this.tenant.init(this.validateForm.value);

    this.saving = true;
    this._tenantService
      .create(this.tenant)
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
    this._subject.destroy();
  }
}
