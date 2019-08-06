import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { AppComponentBase } from '@shared/app-component-base';
import { PagedRequestDto } from '@shared/pagination/paged-listing-component-base';
import { TenantServiceProxy, TenantDto, PagedResultDtoOfTenantDto } from '@shared/service-proxies/service-proxies';
import { AppDialogService } from '@shared/dialog/app-dialog.service';

import { CreateTenantDialogComponent } from './create-tenant/create-tenant-dialog.component';
import { EditTenantDialogComponent } from './edit-tenant/edit-tenant-dialog.component';
import { STComponent, STColumn, STData, STChange } from '@delon/abc';

class PagedTenantsRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

@Component({
  selector: 'app-tenants-list',
  templateUrl: './tenants.component.html',
})
export class TenantsListComponent extends AppComponentBase implements OnInit {
  list = [];
  data: any[] = [];
  loading = false;
  query: PagedTenantsRequestDto = {
    keyword: undefined,
    isActive: undefined,
    skipCount: 0,
    maxResultCount: 10
  };
  @ViewChild('st', { static: true })
  st: STComponent;
  columns: STColumn[] = [
    /* { title: '', index: 'key', type: 'checkbox' }, */
    /* <span>{{ l("Index") }}</span>
          <span>{{ l("TenancyName") }}</span>
          <span>{{ l("Name") }}</span>
          <span>{{ l('IsActive') }}</span>
          <span>{{ l('Actions') }}</span> */
    /* { title: l("Index"), index: 'no' }, */
    { title: this.l('TenancyName'), index: 'tenancyName' },
    { title: this.l('Name'), index: 'name' },
    { title: this.l('IsActive'), index: 'isActive', render: 'isActive' },
    {
      title: this.l('Actions'),
      buttons: [
        {
          text: this.l('Edit'),
          click: (item: any) => this.edit(item.id),
        },
        {
          text: this.l('Delete'),
          click: (item: any) => this.delete(item),
        },
      ],
    },
  ];
  constructor(
    private _tenantService: TenantServiceProxy,
    private _appDialogService: AppDialogService,
    injector: Injector
  ) {
    super(injector);
  }

  load(pi?: number) {
    /* if (typeof pi !== 'undefined') {
      this.pageInfo.pageIndex = pi || 1;
    } */
    this.getTenants();
  }

  getTenants() {
    /* const skipCount = this.pageInfo.skipCount;
    const maxResultCount = this.pageInfo.maxResultCount; */

    this.loading = true;
    this._tenantService
      .getAll(this.query.keyword, this.query.isActive, this.query.skipCount, this.query.maxResultCount)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((result: PagedResultDtoOfTenantDto) => {
        this.data = result.items;
        // this.pageInfo.total = result.totalCount;
      });
  }

  ngOnInit() {
    this.getTenants();
  }

  add() {
    this._appDialogService.show(CreateTenantDialogComponent, { tenantId: null }, 550).subscribe(res => {
      this.load();
    });
  }

  edit(tenantId) {
    this._appDialogService.show(EditTenantDialogComponent, { tenantId }, 550).subscribe(res => {
      // this.load(this.pageInfo.pageIndex);
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
