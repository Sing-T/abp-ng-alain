import { AppConsts } from '@shared/app-consts';
import { UtilsService } from '@abp/utils/utils.service';

export class SignalRAspNetCoreHelper {
  static initSignalR(): void {
    const encryptedAuthToken = new UtilsService().getCookieValue(AppConsts.authorization.encryptedAuthTokenName);

    abp.signalr = {
      autoConnect: true,
      connect: undefined,
      hubs: undefined,
      qs: AppConsts.authorization.encryptedAuthTokenName + '=' + encodeURIComponent(encryptedAuthToken),
      remoteServiceBaseUrl: AppConsts.remoteServiceBaseUrl,
      startConnection: undefined,
      url: '/signalr',
    };

    jQuery.getScript(AppConsts.appBaseUrl + '/assets/abp/abp.signalr-client.js');
  }
}
