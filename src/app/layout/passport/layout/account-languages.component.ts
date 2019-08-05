import { Component, OnInit, Injector, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ALAIN_I18N_TOKEN, SettingsService } from '@delon/theme';
import { I18NService } from '@core';

import { AppConsts } from '@shared/app-consts';
import { AppComponentBase } from '@shared/app-component-base';

import * as _ from 'lodash';

@Component({
  selector: 'passport-account-languages',
  templateUrl: './account-languages.component.html',
  styleUrls: ['./account-languages.component.less'],
})
export class AccountLanguagesComponent extends AppComponentBase implements OnInit {
  languages: abp.localization.ILanguageInfo[];
  currentLanguage: abp.localization.ILanguageInfo;

  get langs() {
    return this.i18n.getLangs();
  }

  constructor(injector: Injector,
    private settings: SettingsService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DOCUMENT) private doc: any) {
    super(injector);
  }

  ngOnInit() {
    this.languages = _.filter(this.localization.languages, l => !l.isDisabled);
    this.currentLanguage = this.localization.currentLanguage;
  }

  change(lang: string) {
    const i18nObj = this.getI18nObj(lang);

    const spinEl = this.doc.createElement('div');
    spinEl.setAttribute('class', `page-loading ant-spin ant-spin-lg ant-spin-spinning`);
    spinEl.innerHTML = `<span class="ant-spin-dot ant-spin-dot-spin"><i></i><i></i><i></i><i></i></span>`;
    this.doc.body.appendChild(spinEl);

    this.i18n.use(i18nObj['code']);
    this.settings.setLayout('lang', i18nObj['code']);
    setTimeout(() => this.changeLanguage(lang));
  }

  getI18nObj(languageName: string) {
    if (!AppConsts.i18nMappings) {
      return {};
    }
    const i18nMappings = _.filter(AppConsts.i18nMappings, { from: languageName });
    if (i18nMappings && i18nMappings.length) {
      const langs = _.filter(this.langs, { code: (i18nMappings[0]).to });
      if (langs && langs.length) {
        return (langs[0]);
      }
    }

    return {};
  }

  changeLanguage(languageName: string): void {
    abp.utils.setCookieValue(
      'Abp.Localization.CultureName',
      languageName,
      new Date(new Date().getTime() + 5 * 365 * 86400000), // 5 year
      abp.appPath,
    );

    location.reload();
  }
}
