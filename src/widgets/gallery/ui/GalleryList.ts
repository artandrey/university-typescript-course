import { IPhoto } from '../../../entities/photo/model';
import { HtmlComponent } from '../../../shared/ui/base/component';

export class GalleryList extends HtmlComponent<HTMLUListElement> {
  constructor(
    selector: string,
    private handleImageClick: (index: number) => void,
  ) {
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
