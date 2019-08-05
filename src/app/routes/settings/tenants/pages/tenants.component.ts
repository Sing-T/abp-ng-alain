import { Component, OnInit, Injector } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { AppComponentBase } from '@shared/app-component-base';
import { PageInfo } from '@shared/pagination/page-info';
import { TenantServiceProxy, TenantDto, PagedResultDtoOfTenantDto } from '@shared/service-proxies/service-proxies';
import { AppDialogService } from '@shared/dialog/app-dialog.service';

import { CreateTenantDialogComponent } from './create-tenant/create-tenant-dialog.component';
import { EditTenantDialogComponent } from './edit-tenant/edit-tenant-dialog.component';

@Component({
  selector: 'app-tenants-list',
  templateUrl: './tenants.component.html',
})
export class TenantsListComponent extends AppComponentBase implements OnInit {
  pageInfo: PageInfo;
  list = [];
  loading = false;

  constructor(
    injector: Injector,
    private _tenantService: TenantServiceProxy,
    private _appDialogService: AppDialogService,
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
    this._appDialogService.show(CreateTenantDialogComponent, { tenantId: null }).subscribe(res => {
      this.load();
    });
  }

  edit(tenantId) {
    this._appDialogService.show(EditTenantDialogComponent, { tenantId }).subscribe(res => {
      this.load(this.pageInfo.pageIndex);
    });
  }

  delete(tenant: TenantDto): void {
    abp.message.confirm(this.l('AreYouSureWantToDelete', tenant.name), this.l('Delete')).then((result: boolean) => {
      if (result) {
        this._tenantService
          .delete(tenant.id)
          .pipe(
            finalize(() => {
              abp.notify.info(this.l('SuccessfullyDeleted'));
              this.load();
            }),
          )
          .subscribe(() => { });
      }
    });
  }
}
