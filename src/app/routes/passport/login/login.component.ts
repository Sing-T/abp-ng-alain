import { Component, Injector } from '@angular/core';

import { AbpSessionService } from '@abp/session/abp-session.service';
import { LoginService } from './login.service';
import { AppComponentBase } from '@shared/app-component-base';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
})
export class UserLoginComponent extends AppComponentBase {
  /**
   * 是否登录中
   */
  submitting = false;

  constructor(
    injector: Injector,
    public loginService: LoginService,
    private _sessionService: AbpSessionService
  ) {
    super(injector);
  }

  /**
   * 多租户
   */
  get multiTenancySideIsTeanant(): boolean {
    return this._sessionService.tenantId > 0;
  }

  /**
   * 允许注册
   */
  get isSelfRegistrationAllowed(): boolean {
    if (!this._sessionService.tenantId) {
      return false;
    }

    return true;
  }

  /**
   * 登录
   */
  submit() {
    this.submitting = true;
    this.loginService.authenticate(() => this.submitting = false);
  }
}