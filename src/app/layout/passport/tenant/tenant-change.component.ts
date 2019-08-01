import { Component, OnInit, Injector } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { AppDialogService } from '@shared/dialog/app-dialog.service';

import { TenantChangeDialogComponent } from './tenant-change-dialog.component';

@Component({
  selector: 'passport-tenant-change',
  templateUrl: './tenant-change.component.html',
})
export class TenantChangeComponent extends AppComponentBase implements OnInit {
  tenancyName: string;
  name: string;
  options = {};

  constructor(injector: Injector, private _appDialogService: AppDialogService) {
    super(injector);
  }

  ngOnInit() {
    if (this.appSession.tenant) {
      this.tenancyName = this.appSession.tenant.tenancyName;
      this.name = this.appSession.tenant.name;
    }
  }

  get isMultiTenancyEnabled(): boolean {
    return abp.multiTenancy.isEnabled;
  }

  /**
   * 显示切换租户弹出框
   */
  showChangeModal(): void {
    this._appDialogService
      .show(TenantChangeDialogComponent, {
        tenancyName: this.tenancyName,
      })
      .subscribe(result => {
        abp.log.debug({
          afterClose: result,
        });
      });
  }
}
