import { StateFullHtmlComponent } from '../../../shared/ui/base/component';

interface INavListItem {
  title: string;
  href: string;
}

interface INavListState {
  items: INavListItem[];
}

export class NavList extends StateFullHtmlComponent<INavListState, HTMLUListElement> {
  protected state: INavListState = { items: [] };

  public setNavItems(items: INavListItem[]) {
    this.setState({ items });
  }

  protected handleStateUpdate(updatedState: INavListState): void {
    this.element.innerHTML = updatedState.items
      .map(
        (item) => `<li class="nav-item active selected">
                  <a class="nav-link" href="${item.href}">${item.title}</a>
                </li>`,
      )
      .join('');
  }
}
