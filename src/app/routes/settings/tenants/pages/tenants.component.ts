import { Component, Injector } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { STPage, STColumn, STChange } from '@delon/abc';

import { AppDialogService } from '@shared/dialog/app-dialog.service';
import { PagedRequestDto, PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { TenantServiceProxy, TenantDto, PagedResultDtoOfTenantDto } from '@shared/service-proxies/service-proxies';

import { CreateTenantDialogComponent } from './create-tenant/create-tenant-dialog.component';
import { EditTenantDialogComponent } from './edit-tenant/edit-tenant-dialog.component';


class PagedTenantsRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

@Component({
  selector: 'app-tenants-list',
  templateUrl: './tenants.component.html',
})
export class TenantsListComponent extends PagedListingComponentBase<TenantDto> {
  tenants: TenantDto[] = [];
  query = {
    keyword: undefined,
    isActive: undefined,
  };
  isActive = [
    { index: 0, text: '是', value: true, checked: false },
    { index: 1, text: '否', value: false, checked: false },
  ];

  pagination: STPage = {
    front: false,
    showSize: true,
  };
  columns: STColumn[] = [
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
    private _appDialogService: AppDialogService,
    private _tenantService: TenantServiceProxy,
    injector: Injector,
  ) {
    super(injector);
  }

  reset() {
    setTimeout(() => this.refresh());
  }

  stChange(e: STChange) {
    switch (e.type) {
      case 'ps':
        this.pageIndex = 1;
        this.pageSize = e.ps;
        this.refresh();
        break;
      case 'pi':
        this.pageIndex = e.pi;
        this.getDataPage(this.pageIndex);
        break;
    }
  }

  list(request: PagedTenantsRequestDto, pageNumber: number, finishedCallback: () => void): void {
    request.keyword = this.replaceNull(this.query.keyword);
    request.isActive = this.replaceNull(this.query.isActive);

    this._tenantService
      .getAll(request.keyword, request.isActive, request.skipCount, request.maxResultCount)
      .pipe(
        finalize(() => {
          finishedCallback();
        }),
      ).subscribe((result: PagedResultDtoOfTenantDto) => {
        this.tenants = result.items;
        this.totalCount = result.totalCount;
        this.showPaging(result, pageNumber);
      });
  }

  create() {
    this._appDialogService.show(CreateTenantDialogComponent, { tenantId: null }, 550).subscribe(res => {
      this.refresh();
    });
  }

  edit(id) {
    this._appDialogService.show(EditTenantDialogComponent, { tenantId: id }, 550).subscribe(res => {
      this.getDataPage(this.pageIndex);
    });
  }

  delete(tenant: TenantDto): void {
    abp.message.confirm(this.l('AreYouSureWantToDelete', tenant.name), this.l('Delete')).then((result: boolean) => {
      if (result) {
        this._tenantService.delete(tenant.id)
          .pipe(
            finalize(() => {
              abp.notify.info(this.l('SuccessfullyDeleted'));
              this.refresh();
            }),
          ).subscribe(() => { });
      }
    });
  }
}
