import { Component, Inject, Input, ChangeDetectionStrategy, Injector, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SettingsService, ALAIN_I18N_TOKEN } from '@delon/theme';
import { InputBoolean } from '@delon/util';
import { I18NService } from '@core';

import { AppComponentBase } from '@shared/app-component-base';
import { UserServiceProxy, ChangeUserLanguageDto } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/app-consts';

import * as _ from 'lodash';

@Component({
  selector: 'header-i18n',
  template: `
    <div *ngIf="showLangText" nz-dropdown [nzDropdownMenu]="langMenu" nzPlacement="bottomRight">
      <i nz-icon nzType="global"></i>
      {{ 'menu.lang' | translate }}
      <i nz-icon nzType="down"></i>
    </div>
    <i
      *ngIf="!showLangText"
      nz-dropdown
      [nzDropdownMenu]="langMenu"
      nzPlacement="bottomRight"
      nz-icon
      nzType="global"
    ></i>
    <nz-dropdown-menu #langMenu="nzDropdownMenu">
      <ul nz-menu>
        <li
          nz-menu-item
          *ngFor="let item of languages"
          [nzSelected]="item.name === currentLanguage.name"
          (click)="change(item.name)"
        >
          <span role="img" [attr.aria-label]="item.displayName" class="pr-xs">{{ getI18nObj(item.name)['abbr'] }}</span>
          {{ item.displayName }}
        </li>
      </ul>
    </nz-dropdown-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderI18nComponent extends AppComponentBase implements OnInit {
  /** Whether to display language text */
  @Input() @InputBoolean() showLangText = true;

  languages: abp.localization.ILanguageInfo[];
  currentLanguage: abp.localization.ILanguageInfo;

  get langs() {
    return this.i18n.getLangs();
  }

  constructor(
    injector: Injector,
    private settings: SettingsService,
    private _userService: UserServiceProxy,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DOCUMENT) private doc: any,
  ) {
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

  /*
   * 这里用了i18n的addr来展示国旗
   * 不用famfamfam-flags是不想在a标签里加i标签 可能就是懒吧
   */
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

  /*
   * 切换多语言
   * 存储cookie值并刷新当前页面
   */
  changeLanguage(languageName: string): void {
    const input = new ChangeUserLanguageDto();
    input.languageName = languageName;

    this._userService.changeLanguage(input).subscribe(() => {
      abp.utils.setCookieValue(
        'Abp.Localization.CultureName',
        languageName,
        new Date(new Date().getTime() + 5 * 365 * 86400000), // 5 year
        abp.appPath
      );

      // window.location.reload();
      this.doc.location.reload()
    });
  }
}
