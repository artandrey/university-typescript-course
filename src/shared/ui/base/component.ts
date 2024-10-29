export class HtmlComponent<Element extends HTMLElement = HTMLElement> {
  private readonly _element: Element;

  constructor(selector: string) {
    const element = document.querySelector<Element>(selector);
    if (!element) throw new Error(`Element with selector: ${selector} was not found`);
    this._element = element;
  }

  public get element(): Element {
    return this._element;
  }
}

type StateUpdater<State> = Partial<State> | ((previous: State) => Partial<State>);

export abstract class StateFull<State extends object> {
  protected abstract state: State;

  protected handleStateUpdate(updatedState: State) {}

  protected setState(updater: StateUpdater<State>) {
    const stateUpdates = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...stateUpdates };
    this.handleStateUpdate(this.state);
  }
}

export abstract class StateFullHtmlComponent<
  State extends object,
  Element extends HTMLElement = HTMLElement,
> extends StateFull<State> {
  private readonly htmlComponent: HtmlComponent<Element>;

  constructor(selector: string) {
    super();
    this.htmlComponent = new HtmlComponent<Element>(selector);
  }

  get element() {
    return this.htmlComponent.element;
  }
}
