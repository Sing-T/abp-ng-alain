import { Component, ChangeDetectionStrategy, Injector, OnInit } from '@angular/core';
import { AppAuthService } from '@shared/auth/app-auth.service';
import { AppComponentBase } from '@shared/app-component-base';

@Component({
  selector: 'header-user',
  template: `
    <div
      class="alain-default__nav-item d-flex align-items-center px-sm"
      nz-dropdown
      nzPlacement="bottomRight"
      [nzDropdownMenu]="userMenu"
    >
      <nz-avatar [nzSrc]="'./assets/tmp/img/avatar.jpg'" nzSize="small" class="mr-sm"></nz-avatar>
      {{ shownLoginName }}
    </div>
    <nz-dropdown-menu #userMenu="nzDropdownMenu">
      <div nz-menu class="width-sm">
        <!-- routerLink="/pro/account/center" -->
        <div nz-menu-item [nzDisabled]="true">
          <i nz-icon nzType="user" class="mr-sm"></i>
          {{ 'menu.account.center' | translate }}
        </div>
        <!-- routerLink="/pro/account/settings" -->
        <div nz-menu-item [nzDisabled]="true">
          <i nz-icon nzType="setting" class="mr-sm"></i>
          {{ 'menu.account.settings' | translate }}
        </div>
        <!-- routerLink="/exception/trigger" -->
        <div nz-menu-item [nzDisabled]="true">
          <i nz-icon nzType="close-circle" class="mr-sm"></i>
          {{ 'menu.account.trigger' | translate }}
        </div>
        <li nz-menu-divider></li>
        <div nz-menu-item (click)="logout()">
          <i nz-icon nzType="logout" class="mr-sm"></i>
          {{ 'menu.account.logout' | translate }}
        </div>
      </div>
    </nz-dropdown-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderUserComponent extends AppComponentBase implements OnInit {
  shownLoginName = '';

  constructor(injector: Injector, private _authService: AppAuthService) {
    super(injector);
  }

  ngOnInit() {
    this.shownLoginName = this.appSession.getShownLoginName();
  }

  logout() {
    this._authService.logout();
  }
}
