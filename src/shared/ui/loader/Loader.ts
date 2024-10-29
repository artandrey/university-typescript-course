import { HtmlComponent } from '../base/component';

export class Loader extends HtmlComponent {
  show() {
    this.element.style.display = 'block';
  }

  hide() {
    this.element.style.display = 'none';
  }
}
