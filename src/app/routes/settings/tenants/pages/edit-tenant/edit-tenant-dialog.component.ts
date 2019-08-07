import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';

import { AppComponentBase } from '@shared/app-component-base';
import { TenantServiceProxy, TenantDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-edit-tenant-dialog',
  templateUrl: './edit-tenant-dialog.component.html',
})
export class EditTenantDialogComponent extends AppComponentBase implements OnInit {
  saving = false;
  validateForm: FormGroup;
  tenant: TenantDto = new TenantDto();

  /**
   * 租主名，使用@Input 传递参数
   */
  @Input() tenantId: number;

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

  ngOnInit(): void {
    this.validateForm = this._fb.group({
      tenancyName: [null, [Validators.required, this.tenancyNameValidator]],
      name: [null, [Validators.required]],
      isActive: [true],
      id: [null]
    });

    if (this.tenantId == null) {
      return;
    }

    this._tenantService.get(this.tenantId).subscribe(res => {
      this.tenant.init(res);
      this.validateForm.patchValue(this.tenant);
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
    this._tenantService.update(this.tenant)
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
