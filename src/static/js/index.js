"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const API_BASE_URL = 'https://jsonplaceholder.typicode.com/';
class PhotoAlbumService {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async getAlbumsByUserId(id) {
        const url = new URL(this.baseUrl);
        url.pathname = '/albums';
        url.searchParams.set('userId', String(id));
        const response = await fetch(url.toString(), { method: 'GET' });
        const albums = await response.json();
        return albums;
    }
    async getPhotosByAlbumId(id) {
        const url = new URL(this.baseUrl);
        url.pathname = '/photos';
        url.searchParams.set('albumId', String(id));
        const response = await fetch(url.toString(), { method: 'GET' });
        const photos = await response.json();
        return photos;
    }
}
class StateFull {
    handleStateUpdate(updatedState) { }
    setState(updater) {
        const stateUpdates = typeof updater === 'function' ? updater(this.state) : updater;
        this.state = { ...this.state, ...stateUpdates };
        this.handleStateUpdate(this.state);
    }
}
class HtmlComponent {
    _element;
    constructor(selector) {
        const element = document.querySelector(selector);
        if (!element)
            throw new Error(`Element with selector: ${selector} was not found`);
        this._element = element;
    }
    get element() {
        return this._element;
    }
}
class StateFullHtmlComponent extends StateFull {
    htmlComponent;
    constructor(selector) {
        super();
        this.htmlComponent = new HtmlComponent(selector);
    }
    get element() {
        return this.htmlComponent.element;
    }
}
class NavList extends StateFullHtmlComponent {
    state = { items: [] };
    setNavItems(items) {
        this.setState({ items });
    }
    handleStateUpdate(updatedState) {
        this.element.innerHTML = updatedState.items
            .map((item) => `<li class="nav-item active selected">
                  <a class="nav-link" href="${item.href}">${item.title}</a>
                </li>`)
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
class GalleryModal extends StateFullHtmlComponent {
    state = {
        isOpened: false,
        currentIndex: 0,
        photos: [],
    };
    init() {
        window.addEventListener('keydown', (event) => {
            if (!this.element.classList.contains('is-open'))
                return;
            this.setState((prev) => {
                if (event.key === 'Escape') {
                    this.close();
                }
                const maxIndex = prev.photos.length;
                let imgIndex = prev.currentIndex;
                if (event.key === 'ArrowLeft') {
                    imgIndex--;
                    if (imgIndex < 0)
                        imgIndex = maxIndex - 1;
                }
                else if (event.key === 'ArrowRight') {
                    imgIndex++;
                    if (imgIndex >= maxIndex)
                        imgIndex = 0;
                }
                return { currentIndex: imgIndex };
            });
        });
    }
    handleStateUpdate(updatedState) {
        if (updatedState.isOpened) {
            this.element.classList.add('is-open');
        }
        else {
            this.element.classList.remove('is-open');
        }
        const image = document.getElementById('lightbox-image');
        image.setAttribute('src', updatedState.photos[updatedState.currentIndex].url);
    }
    open(photos, index) {
        console.log(photos, index);
        this.setState({ photos, currentIndex: index, isOpened: true });
    }
    close() {
        this.setState({ isOpened: false });
    }
}
class GalleryList extends HtmlComponent {
    handleImageClick;
    constructor(selector, handleImageClick) {
        super(selector);
        this.handleImageClick = handleImageClick;
    }
    displayPhotos(photos) {
        this.element.innerHTML = photos
            .map((photo, i) => `<li data-index=${i} class="grid-item">
                  <figure class="effect-bubba">
                    <img src="${photo.thumbnailUrl}" alt="${photo.title}" class="img-fluid tm-img" />
                    <figcaption data-index=${i}>
                      <p class="tm-figure-description">${photo.title}</p>
                    </figcaption>
                  </figure>
                </li>`)
            .join('');
    }
    init() {
        this.element.addEventListener('click', (event) => {
            const target = event.target;
            event.preventDefault();
            this.handleImageClick(+target.getAttribute('data-index'));
        });
    }
}
class HomePage extends StateFull {
    userId;
    state = {
        albums: null,
        photos: null,
        selectedAlbumId: null,
        isLoading: true,
    };
    navList;
    galleryList;
    galleryModal;
    loader;
    photosAlbumService = new PhotoAlbumService(API_BASE_URL);
    constructor(userId, albumId, navListSelector, galleryListSelector, galleryModalSelector, loaderSelector) {
        super();
        this.userId = userId;
        this.state.selectedAlbumId = albumId;
        this.handleImageClick = this.handleImageClick.bind(this);
        this.navList = new NavList(navListSelector);
        this.galleryList = new GalleryList(galleryListSelector, this.handleImageClick);
        this.galleryModal = new GalleryModal(galleryModalSelector);
        this.loader = new Loader(loaderSelector);
    }
    async init() {
        this.galleryList.init();
        this.galleryModal.init();
        const allAlbums = await this.photosAlbumService.getAlbumsByUserId(this.userId);
        let photos = null;
        const selectedAlbumId = this.state.selectedAlbumId ?? allAlbums.at(0)?.id ?? null;
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
    async wait(delay) {
        return new Promise((resolve) => setTimeout(resolve, delay));
    }
    handleImageClick(index) {
        this.galleryModal.open(this.state.photos ?? [], index);
    }
    handleStateUpdate(updatedState) {
        if (updatedState.isLoading) {
            this.loader.show();
        }
        else {
            this.loader.hide();
        }
        this.navList.setNavItems(updatedState.albums?.map((album, i) => ({ title: `Album ${i + 1}`, href: `./?album=${album.id}` })) ?? []);
        this.galleryList.displayPhotos(updatedState.photos ?? []);
    }
}
function getAlbumId() {
    const albumIdQueryValue = new URL(window.location.href).searchParams.get('album');
    return albumIdQueryValue ? +albumIdQueryValue : 1;
}
const homePage = new HomePage(1, getAlbumId(), '#nav-list', '#photos-list', '#lightbox', '#loader-wrapper');
homePage.init();
