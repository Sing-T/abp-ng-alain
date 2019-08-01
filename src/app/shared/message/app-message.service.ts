import { Injectable } from '@angular/core';
import { NzModalService, NzMessageService, NzNotificationService } from 'ng-zorro-antd';

@Injectable()
export class AppMessageService {
  constructor(
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private notificationService: NzNotificationService,
  ) {}

  init() {
    this.initMessage();
    this.initNotify();
  }

  initNotify() {
    abp.notify.info = (message: string, title?: string, options?: any) => {
      this.notificationService.info(title, message, options);
    };
    abp.notify.success = (message: string, title?: string, options?: any) => {
      this.notificationService.success(title, message, options);
    };
    abp.notify.warn = (message: string, title?: string, options?: any) => {
      this.notificationService.warning(title, message, options);
    };
    abp.notify.error = (message: string, title?: string, options?: any) => {
      this.notificationService.error(title, message, options);
    };
  }

  initMessage() {
    abp.message.info = (message: string, options?: any) => {
      this.messageService.info(message, options);
    };

    abp.message.success = (message: string, options?: any) => {
      this.messageService.success(message, options);
    };

    abp.message.warn = (message: string, options?: any) => {
      this.messageService.warning(message, options);
    };

    abp.message.error = (message: string, options?: any) => {
      this.messageService.error(message, options);
    };

    abp.message.confirm = (message: string, title?: any, callback?: any, isHtml?: any) => {
      return new Promise<boolean>((resolve, cancel) => {
        this.modalService.confirm({
          nzTitle: title,
          nzContent: message,
          nzOnOk: () => {
            resolve();
          },
          nzOnCancel: () => {},
        });
      });
    };
  }
}
