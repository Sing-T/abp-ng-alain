import { Component, Injector, Input } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { AccountServiceProxy, IsTenantAvailableInput } from '@shared/service-proxies/service-proxies';
import { AppTenantAvailabilityState } from '@shared/app-enums';

import { NzModalRef } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'passport-tenant-change-dialog',
  templateUrl: './tenant-change-dialog.component.html',
})
export class TenantChangeDialogComponent extends AppComponentBase {
  saving = false;

  /**
   * 租主名，使用@Input 传递参数
   */
  @Input() tenancyName = '';

  constructor(
    private _accountService: AccountServiceProxy,
    private _subject: NzModalRef,
    injector: Injector,
  ) {
    super(injector);
  }

  show(tenancyName: string): void {
    this.tenancyName = tenancyName;
  }

  /**
   * 保存操作，如果租户为空，则清空cookie租户信息，并重新加载当前页面
   * 如果租户名正确，则保存当前租户名到cookie，并重新加载当前页面
   */
  save(): void {
    if (!this.tenancyName) {
      abp.multiTenancy.setTenantIdCookie(undefined);
      this.close();
      location.reload();
      return;
    }

    const input = new IsTenantAvailableInput();
    input.tenancyName = this.tenancyName;

    this.saving = true;
    // 验证租户
    this._accountService.isTenantAvailable(input)
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
      ).subscribe(result => {
        switch (result.state) {
          case AppTenantAvailabilityState.Available:
            abp.multiTenancy.setTenantIdCookie(result.tenantId);
            this.close();
            location.reload();
            return;
          case AppTenantAvailabilityState.InActive:
            this.message.warn(this.l('TenantIsNotActive', this.tenancyName));
            break;
          case AppTenantAvailabilityState.NotFound: // NotFound
            this.message.warn(this.l('ThereIsNoTenantDefinedWithName{0}', this.tenancyName));
            break;
        }
      });
  }

  /**
   * 关闭弹出窗
   */
  close(): void {
    this._subject.destroy();
  }
}
