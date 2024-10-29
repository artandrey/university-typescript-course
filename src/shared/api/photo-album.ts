import { IAlbum } from '../../entities/album/model';
import { IPhoto } from '../../entities/photo/model';
import { API_BASE_URL } from './config';

export class PhotoAlbumService {
  constructor(private readonly baseUrl: string = API_BASE_URL) {}

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
