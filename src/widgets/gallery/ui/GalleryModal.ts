import { IPhoto } from '../../../entities/photo/model';
import { StateFullHtmlComponent } from '../../../shared/ui/base/component';

interface IGalleryModalState {
  isOpened: boolean;
  currentIndex: number;
  photos: IPhoto[];
}

export class GalleryModal extends StateFullHtmlComponent<IGalleryModalState, HTMLDivElement> {
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
    this.setState({ photos, currentIndex: index, isOpened: true });
  }

  public close() {
    this.setState({ isOpened: false });
  }
}
