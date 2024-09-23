const API_BASE_URL = 'https://jsonplaceholder.typicode.com/';

interface IAlbum {
  userId: number;
  id: number;
  title: string;
}

interface IPhoto {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

class PhotoAlbumService {
  constructor(private readonly baseUrl: string) {}

  public async getAlbumsByUserId(id: number): Promise<IAlbum[]> {
    const url = new URL(this.baseUrl);
    url.pathname = '/albums';

    url.searchParams.set('userId', String(id));

    const response = await fetch(url.toString(), { method: 'GET' });
    const albums = await response.json();
    return albums;
  }

  public async getPhotosByAlbumId(id: number): Promise<IPhoto[]> {
    const url = new URL(this.baseUrl);
    url.pathname = '/photos';
    url.searchParams.set('albumId', String(id));

    const response = await fetch(url.toString(), { method: 'GET' });
    const photos = await response.json();
    return photos;
  }
}

type StateUpdater<State> = Partial<State> | ((previous: State) => Partial<State>);

abstract class StateFull<State extends object> {
  protected abstract state: State;

  protected handleStateUpdate(updatedState: State) {}

  protected setState(updater: StateUpdater<State>) {
    const stateUpdates = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...stateUpdates };
    this.handleStateUpdate(this.state);
  }
}

class HtmlComponent<Element extends HTMLElement = HTMLElement> {
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

abstract class StateFullHtmlComponent<
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

interface INavListItem {
  title: string;
  href: string;
}

interface INavListState {
  items: INavListItem[];
}

class NavList extends StateFullHtmlComponent<INavListState, HTMLUListElement> {
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

class Loader extends HtmlComponent {
  show() {
    this.element.style.display = 'block';
  }

  hide() {
    this.element.style.display = 'none';
  }
}

interface IGalleryModalState {
  isOpened: boolean;
  currentIndex: number;
  photos: IPhoto[];
}

class GalleryModal extends StateFullHtmlComponent<IGalleryModalState, HTMLDivElement> {
  protected state: IGalleryModalState = {
    isOpened: false,
    currentIndex: 0,
    photos: [],
  };

  public init() {
    window.addEventListener('keydown', (event) => {
      if (!this.element.classList.contains('is-open')) return;

      this.setState((prev) => {
        if (event.key === 'Escape') {
          this.close();
        }

        const maxIndex = prev.photos.length;
        let imgIndex = prev.currentIndex;

        if (event.key === 'ArrowLeft') {
          imgIndex--;
          if (imgIndex < 0) imgIndex = maxIndex - 1;
        } else if (event.key === 'ArrowRight') {
          imgIndex++;
          if (imgIndex >= maxIndex) imgIndex = 0;
        }

        return { currentIndex: imgIndex };
      });
    });
  }

  protected handleStateUpdate(updatedState: IGalleryModalState): void {
    if (updatedState.isOpened) {
      this.element.classList.add('is-open');
    } else {
      this.element.classList.remove('is-open');
    }
    const image = document.getElementById('lightbox-image') as HTMLImageElement;
    image.setAttribute('src', updatedState.photos[updatedState.currentIndex].url);
  }

  public open(photos: IPhoto[], index: number) {
    console.log(photos, index);

    this.setState({ photos, currentIndex: index, isOpened: true });
  }

  public close() {
    this.setState({ isOpened: false });
  }
}

class GalleryList extends HtmlComponent<HTMLUListElement> {
  constructor(selector: string, private handleImageClick: (index: number) => void) {
    super(selector);
  }

  public displayPhotos(photos: IPhoto[]) {
    this.element.innerHTML = photos
      .map(
        (photo, i) => `<li data-index=${i} class="grid-item">
                  <figure class="effect-bubba">
                    <img src="${photo.thumbnailUrl}" alt="${photo.title}" class="img-fluid tm-img" />
                    <figcaption data-index=${i}>
                      <p class="tm-figure-description">${photo.title}</p>
                    </figcaption>
                  </figure>
                </li>`,
      )
      .join('');
  }

  public init() {
    this.element.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      event.preventDefault();
      this.handleImageClick(+target.getAttribute('data-index')!);
    });
  }
}

export interface IHomePageState {
  albums: IAlbum[] | null;
  photos: IPhoto[] | null;
  selectedAlbumId: number | null;
  isLoading: boolean;
}

class HomePage extends StateFull<IHomePageState> {
  protected state: IHomePageState = {
    albums: null,
    photos: null,
    selectedAlbumId: null,
    isLoading: true,
  };

  private readonly navList: NavList;
  private readonly galleryList: GalleryList;
  private readonly galleryModal: GalleryModal;
  private readonly loader: Loader;

  private readonly photosAlbumService: PhotoAlbumService = new PhotoAlbumService(API_BASE_URL);

  constructor(
    private readonly userId: number,
    albumId: number,
    navListSelector: string,
    galleryListSelector: string,
    galleryModalSelector: string,
    loaderSelector: string,
  ) {
    super();
    this.state.selectedAlbumId = albumId;
    this.handleImageClick = this.handleImageClick.bind(this);
    this.navList = new NavList(navListSelector);

    this.galleryList = new GalleryList(galleryListSelector, this.handleImageClick);
    this.galleryModal = new GalleryModal(galleryModalSelector);
    this.loader = new Loader(loaderSelector);
  }

  public async init() {
    this.galleryList.init();
    this.galleryModal.init();
    const allAlbums = await this.photosAlbumService.getAlbumsByUserId(this.userId);
    let photos: IPhoto[] | null = null;
    const selectedAlbumId: number | null = this.state.selectedAlbumId ?? allAlbums.at(0)?.id ?? null;
    if (selectedAlbumId) {
      photos = await this.photosAlbumService.getPhotosByAlbumId(selectedAlbumId);
    }

    await this.wait(1000);

    this.setState({
      albums: allAlbums.slice(0, 5),
      photos,
      selectedAlbumId,
      isLoading: false,
    });
  }

  private async wait(delay: number) {
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private handleImageClick(index: number) {
    this.galleryModal.open(this.state.photos ?? [], index);
  }

  protected handleStateUpdate(updatedState: IHomePageState): void {
    if (updatedState.isLoading) {
      this.loader.show();
    } else {
      this.loader.hide();
    }
    this.navList.setNavItems(
      updatedState.albums?.map((album, i) => ({ title: `Album ${i + 1}`, href: `./?album=${album.id}` })) ?? [],
    );
    this.galleryList.displayPhotos(updatedState.photos ?? []);
  }
}

function getAlbumId() {
  const albumIdQueryValue = new URL(window.location.href).searchParams.get('album');

  return albumIdQueryValue ? +albumIdQueryValue : 1;
}
const homePage = new HomePage(1, getAlbumId(), '#nav-list', '#photos-list', '#lightbox', '#loader-wrapper');
homePage.init();
