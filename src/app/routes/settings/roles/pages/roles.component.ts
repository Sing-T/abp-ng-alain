import { Component, OnInit, Injector } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { AppComponentBase } from '@shared/app-component-base';
import { PageInfo } from '@shared/pagination/page-info';
import { AppDialogService } from '@shared/dialog/app-dialog.service';
import { RoleServiceProxy, RoleDto, PagedResultDtoOfRoleDto } from "@shared/service-proxies/service-proxies";

import { CreateRoleDialogComponent } from './create-role/create-role-dialog.component';
import { EditRoleDialogComponent } from './edit-role/edit-role-dialog.component';

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles.component.html',
})
export class RolesListComponent extends AppComponentBase implements OnInit {
  pageInfo: PageInfo;
  list = [];
  loading = false;

  constructor(injector: Injector, private _appModalService: AppDialogService, private _roleService: RoleServiceProxy) {
    super(injector);
    this.pageInfo = new PageInfo();
  }

  ngOnInit() {
    this.load();
  }

  load(pi?: number) {
    if (typeof pi !== 'undefined') {
      this.pageInfo.pageIndex = pi || 1;
    }
    this.getRoles();
  }

  getRoles() {
    const skipCount = this.pageInfo.skipCount;
    const maxResultCount = this.pageInfo.maxResultCount;
    this.loading = true;
    this._roleService
      .getAll(undefined, skipCount, maxResultCount)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((result: PagedResultDtoOfRoleDto) => {
        this.list = result.items;
        this.pageInfo.total = result.totalCount;
      });
  }

  add() {
    this._appModalService.show(CreateRoleDialogComponent)
      .subscribe((res) => {
        this.load();
      });
  }

  edit(id: number): void {
    this._appModalService.show(EditRoleDialogComponent, {
      roleId: id
    }).subscribe(res => {
      this.load();
    });
  }

  delete(role: RoleDto): void {
    abp.message.confirm("Remove Users from Role and delete Role '" + role.displayName + "'?", 'Delete Role').then((result: boolean) => {
      if (result) {
        this._roleService
          .delete(role.id)
          .pipe(
            finalize(() => {
              abp.notify.info("Deleted Role: " + role.displayName);
              this.load();
            }),
          )
          .subscribe(() => { });
      }
    });
  }
}
