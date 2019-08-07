export class UrlHelper {
  /**
   * The URL requested, before initial routing.
   */
  static readonly initialUrl = location.href;

  static getQueryParameters(): any {
    return document.location.search
      .replace(/(^\?)/, '')
      .split('&')
      .map(function (n) {
        n = n.split('=');
        this[n[0]] = n[1];
        return this;
      }.bind({})
      )[0];
  }
}
