import { Component, OnInit, Injector, Input } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { finalize } from 'rxjs/operators';

import { AppComponentBase } from '@shared/app-component-base';
import { TenantServiceProxy, CreateTenantDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-create-tenant-modal',
  templateUrl: './create-tenant-modal.component.html',
})
export class CreateTenantModalComponent extends AppComponentBase implements OnInit {
  saving = false;
  tenant: CreateTenantDto = null;

  /**
   * 租主名，使用@Input 传递参数
   */
  @Input() tenantId: number;

  constructor(private _tenantService: TenantServiceProxy, private subject: NzModalRef, injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.tenant = new CreateTenantDto();
    this.tenant.init({ isActive: true });
  }

  /**
   * 保存操作
   */
  save(): void {
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
    this.subject.destroy();
  }
}
