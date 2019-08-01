import { Component, Injector, Input, AfterViewInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';

import { AppComponentBase } from '@shared/app-component-base';
import { TenantServiceProxy, TenantDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-edit-tenant-dialog',
  templateUrl: './edit-tenant-dialog.component.html',
})
export class EditTenantDialogComponent extends AppComponentBase implements AfterViewInit {
  saving = false;

  tenant: TenantDto = null;

  /**
   * 租主名，使用@Input 传递参数
   */
  @Input() tenantId: number;

  constructor(private _tenantService: TenantServiceProxy, private subject: NzModalRef, injector: Injector) {
    super(injector);
    this.tenant = new TenantDto();
  }

  ngAfterViewInit(): void {
    if (this.tenantId == null) {
      return;
    }

    this._tenantService
      .get(this.tenantId)
      .pipe(finalize(() => {}))
      .subscribe(res => {
        this.tenant = res;
      });
  }

  /**
   * 保存操作
   */
  save(): void {
    this.saving = true;
    this._tenantService
      .update(this.tenant)
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
