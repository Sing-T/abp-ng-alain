// tslint:disable: no-duplicate-imports
import { NgModule, LOCALE_ID, APP_INITIALIZER, Injector } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// #region default language
// Reference: https://ng-alain.com/docs/i18n
import { default as ngLang } from '@angular/common/locales/en';
import { NZ_I18N, en_US as zorroLang } from 'ng-zorro-antd';
import { DELON_LOCALE, en_US as delonLang } from '@delon/theme';
const LANG = {
  abbr: 'en',
  ng: ngLang,
  zorro: zorroLang,
  delon: delonLang,
};
// register angular
import { PlatformLocation, registerLocaleData } from '@angular/common';
registerLocaleData(LANG.ng, LANG.abbr);
const LANG_PROVIDES = [
  { provide: LOCALE_ID, useValue: LANG.abbr },
  { provide: NZ_I18N, useValue: LANG.zorro },
  { provide: DELON_LOCALE, useValue: LANG.delon },
];
// #endregion
// #region i18n services
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core/i18n/i18n.service';

export function I18nHttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, `assets/tmp/i18n/`, '.json');
}

const I18NSERVICE_MODULES = [
  TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: I18nHttpLoaderFactory,
      deps: [HttpClient],
    },
  }),
];

const I18NSERVICE_PROVIDES = [{ provide: ALAIN_I18N_TOKEN, useClass: I18NService, multi: false }];
// #region

// #region JSON Schema form (using @delon/form)
import { JsonSchemaModule } from '@shared/json-schema/json-schema.module';
const FORM_MODULES = [JsonSchemaModule];
// #endregion

// #region Http Interceptors
import { HTTP_INTERCEPTORS } from '@angular/common/http';
/* import { SimpleInterceptor } from '@delon/auth';
import { DefaultInterceptor } from '@core/net/default.interceptor'; */
import { AbpHttpInterceptor } from 'abp-ng2-module/dist/src/abpHttpInterceptor';
const INTERCEPTOR_PROVIDES = [
  /* { provide: HTTP_INTERCEPTORS, useClass: SimpleInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true }, */
  { provide: HTTP_INTERCEPTORS, useClass: AbpHttpInterceptor, multi: true },
];
// #endregion

// #region global third module
const GLOBAL_THIRD_MODULES = [];
// #endregion

// #region Startup Service
import { StartupService } from '@core/startup/startup.service';
import { AppConsts } from '@shared/app-consts';
import { AppPreBootstrap } from 'src/app-pre-bootstrap';
import { AppSessionService } from '@shared/session/app-session.service';
import { AppMessageService } from '@shared/message/app-message.service';
export function StartupServiceFactory(
  injector: Injector,
  startupService: StartupService,
  platformLocation: PlatformLocation,
) {
  return () =>
    startupService
      .load()
      .then(() => {
        const message = injector.get(AppMessageService);
        message.init();

        // abp.ui.setBusy();
        return new Promise<boolean>((resolve, reject) => {
          AppConsts.appBaseHref = getBaseHref(platformLocation);
          const appBaseUrl = getDocumentOrigin() + AppConsts.appBaseHref;

          AppPreBootstrap.run(appBaseUrl, () => {
            abp.event.trigger('abp.dynamicScriptsInitialized');
            const appSessionService: AppSessionService = injector.get(AppSessionService);
            appSessionService.init().then(
              result => {
                // abp.ui.clearBusy();

                if (shouldLoadLocale()) {
                  const angularLocale = convertAbpLocaleToAngularLocale(abp.localization.currentLanguage.name);
                  import(`@angular/common/locales/${angularLocale}.js`).then(module => {
                    registerLocaleData(module.default);
                    resolve(result);
                  }, reject);
                } else {
                  resolve(result);
                }
              },
              err => {
                // abp.ui.clearBusy();
                reject(err);
              },
            );
          });
        });
      })
      .then(() => {});
}
const APPINIT_PROVIDES = [
  StartupService,
  {
    provide: APP_INITIALIZER,
    useFactory: StartupServiceFactory,
    deps: [Injector, StartupService, PlatformLocation],
    multi: true,
  },
];
// #endregion

import { DelonModule } from './delon.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { RoutesModule } from './routes/routes.module';
import { LayoutModule } from './layout/layout.module';
import { AbpSharedModule } from '@shared/abp-shared.module';
import { AbpModule } from 'abp-ng2-module/dist/src/abp.module';
import { ServiceProxyModule } from '@shared/service-proxies/service-proxy.module';
import { API_BASE_URL } from '@shared/service-proxies/service-proxies';
import * as _ from 'lodash';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    DelonModule.forRoot(),
    AbpSharedModule.forRoot(),
    AbpSharedModule,
    AbpModule,
    ServiceProxyModule,
    CoreModule,
    SharedModule,
    LayoutModule,
    RoutesModule,
    ...I18NSERVICE_MODULES,
    ...FORM_MODULES,
    ...GLOBAL_THIRD_MODULES,
  ],
  providers: [
    ...LANG_PROVIDES,
    ...INTERCEPTOR_PROVIDES,
    ...I18NSERVICE_PROVIDES,
    ...APPINIT_PROVIDES,
    { provide: API_BASE_URL, useFactory: getRemoteServiceBaseUrl },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

export function getBaseHref(platformLocation: PlatformLocation): string {
  const baseUrl = platformLocation.getBaseHrefFromDOM();
  if (baseUrl) {
    return baseUrl;
  }

  return '/';
}

function getDocumentOrigin() {
  if (!document.location.origin) {
    const port = document.location.port ? ':' + document.location.port : '';
    return document.location.protocol + '//' + document.location.hostname + port;
  }

  return document.location.origin;
}

export function shouldLoadLocale(): boolean {
  return abp.localization.currentLanguage.name && abp.localization.currentLanguage.name !== 'en-US';
}

export function convertAbpLocaleToAngularLocale(locale: string): string {
  if (!AppConsts.localeMappings) {
    return locale;
  }

  const localeMapings = _.filter(AppConsts.localeMappings, { from: locale });
  if (localeMapings && localeMapings.length) {
    return localeMapings[0].to;
  }

  return locale;
}

export function getRemoteServiceBaseUrl(): string {
  return AppConsts.remoteServiceBaseUrl;
}
