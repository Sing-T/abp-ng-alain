import { Injectable, Type } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';

/**
 * 弹出框服务
 */
@Injectable()
export class AppDialogService {
  constructor(private _modalService: NzModalService) { }

  /**
   * 显示弹出框
   * @param content 弹出框内容，可以是文本或组件
   * @param componentParams 弹出框参数，一般是json对象
   * @param nzWidth 弹出框宽度，单位为px
   */
  show(content: string | Type<any>, componentParams?: object, nzWidth?: number) {
    const options = {
      nzContent: content,
      nzFooter: null,
      nzComponentParams: componentParams,
    };

    // tslint:disable-next-line: no-string-literal
    if (nzWidth) options['nzWidth'] = nzWidth;

    const modal = this._modalService.create(options);
    return modal.afterClose;
  }
}
