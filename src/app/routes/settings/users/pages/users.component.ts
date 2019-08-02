import { Component, OnInit, Injector } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { AppComponentBase } from '@shared/app-component-base';
import { PageInfo } from '@shared/pagination/page-info';
import { AppDialogService } from '@shared/dialog/app-dialog.service';
import { UserServiceProxy, UserDto, PagedResultDtoOfUserDto } from '@shared/service-proxies/service-proxies';

import { CreateUserDialogComponent } from './create-user/create-user-dialog.component';
import { EditUserDialogComponent } from './edit-user/edit-user-dialog.component';

@Component({
  selector: 'app-users-list',
  templateUrl: './users.component.html',
})
export class UsersListComponent extends AppComponentBase implements OnInit {
  pageInfo: PageInfo;
  list = [];
  loading = false;

  constructor(injector: Injector, private _appDialogService: AppDialogService, private _userService: UserServiceProxy) {
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
    this.getUsers();
  }

  getUsers() {
    const skipCount = this.pageInfo.skipCount;
    const maxResultCount = this.pageInfo.maxResultCount;
    this.loading = true;
    this._userService
      .getAll(undefined, undefined, skipCount, maxResultCount)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((result: PagedResultDtoOfUserDto) => {
        this.list = result.items;
        this.pageInfo.total = result.totalCount;
      });
  }

  add() {
    this._appDialogService.show(CreateUserDialogComponent).subscribe(res => {
      this.load();
    });
  }

  edit(id: number): void {
    this._appDialogService
      .show(EditUserDialogComponent, {
        userId: id,
      })
      .subscribe(res => {
        this.load();
      });
  }

  delete(user: UserDto): void {
    abp.message.confirm("Delete user '" + user.fullName + "'?", 'Delete User').then((result: boolean) => {
      if (result) {
        this._userService
          .delete(user.id)
          .pipe(
            finalize(() => {
              abp.notify.info('Deleted User: ' + user.fullName);
              this.load();
            }),
          )
          .subscribe(() => { });
      }
    });
  }
}
