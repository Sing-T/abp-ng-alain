import { AppComponentBase } from '@shared/app-component-base';
import { Injector, OnInit } from '@angular/core';

export class EntityDto {
  id: number;
}

export class PagedRequestDto {
  skipCount: number;
  maxResultCount: number;
}

export class PagedResultDto {
  items: any[];
  totalCount: number;
}

export abstract class PagedListingComponentBase<TEntityDto> extends AppComponentBase implements OnInit {
  public pageSize = 10;
  public pageIndex = 1;
  public totalPages = 1;
  public totalCount: number;
  public isTableLoading = false;

  constructor(injector: Injector) {
    super(injector);
  }

  replaceNull(value: any) {
    if (value === null) return undefined;
    return value;
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.getDataPage(1);
  }

  public showPaging(result: PagedResultDto, pageIndex: number): void {
    this.totalPages = (result.totalCount - (result.totalCount % this.pageSize)) / this.pageSize + 1;

    this.totalCount = result.totalCount;
    this.pageIndex = pageIndex;
  }

  public getDataPage(pageIndex: number, pageSize?: number): void {
    pageSize = pageSize || this.pageSize;

    const request = new PagedRequestDto();
    request.maxResultCount = pageSize;
    request.skipCount = (pageIndex - 1) * pageSize;

    this.isTableLoading = true;
    this.list(request, pageIndex, () => {
      this.isTableLoading = false;
    });
  }

  protected abstract list(request: PagedRequestDto, pageIndex: number, finishedCallback: () => void): void;
  protected abstract delete(entity: TEntityDto): void;
}
