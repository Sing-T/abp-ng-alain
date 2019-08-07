import { Component, Injector } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { STPage, STColumn, STChange } from '@delon/abc';

import { AppDialogService } from '@shared/dialog/app-dialog.service';
import { PagedListingComponentBase, PagedRequestDto } from '@shared/paged-listing-component-base';
import { RoleServiceProxy, RoleDto, PagedResultDtoOfRoleDto } from "@shared/service-proxies/service-proxies";

import { CreateRoleDialogComponent } from './create-role/create-role-dialog.component';
import { EditRoleDialogComponent } from './edit-role/edit-role-dialog.component';

class PagedRolesRequestDto extends PagedRequestDto {
  keyword: string;
}

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles.component.html',
})

export class RolesListComponent extends PagedListingComponentBase<RoleDto> {
  roles: RoleDto[] = [];
  query = {
    keyword: undefined
  };

  pagination: STPage = {
    front: false,
    showSize: true,
  };
  columns: STColumn[] = [
    { title: this.l('RoleName'), index: 'name' },
    { title: this.l('DisplayName'), index: 'displayName' },
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
    private _roleService: RoleServiceProxy,
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

  list(request: PagedRolesRequestDto, pageNumber: number, finishedCallback: () => void): void {
    request.keyword = this.replaceNull(this.query.keyword);

    this._roleService
      .getAll(request.keyword, request.skipCount, request.maxResultCount)
      .pipe(
        finalize(() => {
          finishedCallback();
        }),
      ).subscribe((result: PagedResultDtoOfRoleDto) => {
        this.roles = result.items;
        this.totalCount = result.totalCount;
        this.showPaging(result, pageNumber);
      });
  }

  create() {
    this._appDialogService.show(CreateRoleDialogComponent).subscribe((res) => {
      this.refresh();
    });
  }

  edit(id: number): void {
    this._appDialogService.show(EditRoleDialogComponent, { roleId: id }).subscribe(res => {
      this.getDataPage(this.pageIndex);
    });
  }

  delete(role: RoleDto): void {
    abp.message.confirm(this.l('AreYouSureWantToDelete', role.displayName), this.l('Delete')).then((result: boolean) => {
      if (result) {
        this._roleService.delete(role.id)
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
