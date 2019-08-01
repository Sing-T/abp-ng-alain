import { Component, OnInit, Injector } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { AppComponentBase } from '@shared/app-component-base';
import { PageInfo } from '@shared/pagination/page-info';
import { TenantServiceProxy, TenantDto, PagedResultDtoOfTenantDto } from '@shared/service-proxies/service-proxies';
import { AppModalService } from '@shared/modal/app-modal.service';

import { CreateTenantModalComponent } from './create-tenant-modal.component';
import { EditTenantModalComponent } from './edit-tenant-modal.component';

@Component({
  selector: 'app-tenants-list',
  templateUrl: './list.component.html',
})
export class TenantsListComponent extends AppComponentBase implements OnInit {
  pageInfo: PageInfo;
  list = [];
  loading = false;

  constructor(
    injector: Injector,
    private _tenantService: TenantServiceProxy,
    private _appModalService: AppModalService,
  ) {
    super(injector);
    this.pageInfo = new PageInfo();
  }

  load(pi?: number) {
    if (typeof pi !== 'undefined') {
      this.pageInfo.pageIndex = pi || 1;
    }
    this.getTenants();
  }

  getTenants() {
    const skipCount = this.pageInfo.skipCount;
    const maxResultCount = this.pageInfo.maxResultCount;

    this.loading = true;
    this._tenantService
      .getAll(undefined, undefined, skipCount, maxResultCount)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((result: PagedResultDtoOfTenantDto) => {
        this.list = result.items;
        this.pageInfo.total = result.totalCount;
      });
  }

  ngOnInit() {
    this.getTenants();
  }

  add() {
    this._appModalService.show(CreateTenantModalComponent, { tenantId: null }).subscribe(res => {
      this.load();
    });
  }

  edit(tenantId) {
    this._appModalService.show(EditTenantModalComponent, { tenantId }).subscribe(res => {
      this.load(this.pageInfo.pageIndex);
    });
  }

  delete(tenant: TenantDto): void {
    abp.message.confirm("Delete tenant '" + tenant.name + "'?", 'Delete Tenant').then((result: boolean) => {
      if (result) {
        this._tenantService
          .delete(tenant.id)
          .pipe(
            finalize(() => {
              abp.notify.info('Deleted tenant: ' + tenant.name);
              this.load();
            }),
          )
          .subscribe(() => {});
      }
    });
  }
}
