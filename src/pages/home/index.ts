import { IAlbum } from '../../entities/album/model';
import { IPhoto } from '../../entities/photo/model';
import { PhotoAlbumService } from '../../shared/api/photo-album';
import { StateFull } from '../../shared/ui/base/component';
import { Loader } from '../../shared/ui/loader/Loader';
import { GalleryList } from '../../widgets/gallery/ui/GalleryList';
import { GalleryModal } from '../../widgets/gallery/ui/GalleryModal';
import { NavList } from '../../widgets/nav/ui/NavList';

export interface IHomePageState {
  albums: IAlbum[] | null;
  photos: IPhoto[] | null;
  selectedAlbumId: number | null;
  isLoading: boolean;
}

export class HomePage extends StateFull<IHomePageState> {
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
  private readonly photosAlbumService: PhotoAlbumService = new PhotoAlbumService();

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

    await this.wait(2000);

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
