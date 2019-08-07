import { Component, Injector } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { STPage, STColumn, STChange } from '@delon/abc';

import { AppDialogService } from '@shared/dialog/app-dialog.service';
import { PagedRequestDto, PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { UserServiceProxy, UserDto, PagedResultDtoOfUserDto } from '@shared/service-proxies/service-proxies';

import { CreateUserDialogComponent } from './create-user/create-user-dialog.component';
import { EditUserDialogComponent } from './edit-user/edit-user-dialog.component';

class PagedUsersRequestDto extends PagedRequestDto {
  keyword: string;
  isActive: boolean | null;
}

@Component({
  selector: 'app-users-list',
  templateUrl: './users.component.html',
})
export class UsersListComponent extends PagedListingComponentBase<UserDto> {
  users: UserDto[] = [];
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
    { title: this.l('UserName'), index: 'userName' },
    { title: this.l('FullName'), index: 'fullName' },
    { title: this.l('EmailAddress'), index: 'emailAddress' },
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
    private _userService: UserServiceProxy,
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

  list(request: PagedUsersRequestDto, pageNumber: number, finishedCallback: () => void): void {
    request.keyword = this.replaceNull(this.query.keyword);
    request.isActive = this.replaceNull(this.query.isActive);

    this._userService
      .getAll(request.keyword, request.isActive, request.skipCount, request.maxResultCount)
      .pipe(
        finalize(() => {
          finishedCallback();
        }),
      ).subscribe((result: PagedResultDtoOfUserDto) => {
        this.users = result.items;
        this.totalCount = result.totalCount;
        this.showPaging(result, pageNumber);
      });
  }

  create() {
    this._appDialogService.show(CreateUserDialogComponent).subscribe(res => {
      this.refresh();
    });
  }

  edit(id: number): void {
    this._appDialogService.show(EditUserDialogComponent, { userId: id }).subscribe(res => {
      this.getDataPage(this.pageIndex);
    });
  }

  delete(user: UserDto): void {
    abp.message.confirm(this.l('AreYouSureWantToDelete', user.fullName), this.l('Delete')).then((result: boolean) => {
      if (result) {
        this._userService.delete(user.id)
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
