import { HomePage } from '../pages/home/index';

function getAlbumId() {
  const albumIdQueryValue = new URL(window.location.href).searchParams.get('album');
  return albumIdQueryValue ? +albumIdQueryValue : 1;
}

const homePage = new HomePage(1, getAlbumId(), '#nav-list', '#photos-list', '#lightbox', '#loader-wrapper');
homePage.init();
