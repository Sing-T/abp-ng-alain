import { Component, ChangeDetectionStrategy, OnInit, Injector } from '@angular/core';
import { AppAuthService } from '@shared/auth/app-auth.service';
import { AppComponentBase } from '@shared/app-component-base';

@Component({
  selector: 'layout-sidebar',
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent extends AppComponentBase implements OnInit {
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
