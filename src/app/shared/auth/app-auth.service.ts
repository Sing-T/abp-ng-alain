import { Injectable } from '@angular/core';
import { AppConsts } from '@shared/app-consts';

@Injectable()
export class AppAuthService {
  logout(reload?: boolean): void {
    abp.auth.clearToken();
    abp.utils.setCookieValue(AppConsts.authorization.encryptedAuthTokenName, undefined, undefined, abp.appPath);
    if (reload !== false) {
      location.href = AppConsts.appBaseUrl;
    }
  }
}
