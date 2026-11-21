'use strict';

const photoDialog = document.getElementById('photo-dialog');
const galleryMotion = matchMedia('(prefers-reduced-motion: reduce)');
let photoCarousel;

function galleryControls() {
  return `<button type="button" class="gallery-prev" aria-label="${esc(t('previousPhoto'))}">${siteIcon('arrow-left', 18)}</button>
    <button type="button" class="gallery-next" aria-label="${esc(t('nextPhoto'))}">${siteIcon('arrow-right', 18)}</button>`;
}

function galleryNavigation(element) {
  return {
    prevEl: element.querySelector('.gallery-prev'),
    nextEl: element.querySelector('.gallery-next'),
    addIcons: false
  };
}

function archivePhotos(building) {
  const photos = [...(building.gallery || [])];
  if (building.photo && !photos.some(item => item.photo === building.photo)) {
    photos.push({ photo: building.photo, caption: building.photoCaption || building.name, credit: building.photoCredit });
  }
  return photos;
}

function archiveGallery(building) {
  if (!archivePhotos(building).length) return '';
  const instructions = isEnglish
    ? 'Drag in any direction, or use the arrow keys. Press Enter to open the center photo.'
    : '可向任意方向拖动，或使用方向键浏览。按回车放大中央照片。';
  return `<section class="archive-gallery" aria-labelledby="archive-gallery-title">
    <div class="archive-canvas" tabindex="0" role="region" aria-labelledby="archive-gallery-title" aria-describedby="archive-gallery-instructions">
      <div class="archive-tiles"></div>
    </div>
    <span class="archive-instructions" id="archive-gallery-instructions">${instructions}</span>
    <div class="archive-label">
      <h3 id="archive-gallery-title">${esc(t('gallery'))}</h3>
    </div>
  </section>`;
}

function mountArchiveGallery(building, app) {
  const gallery = app.querySelector('.archive-gallery');
  if (gallery) mountArchiveCanvas(gallery, building.name, archivePhotos(building));
  const photos = building.gallery || [];
  if (!building.photo) return;
  const cover = { photo: building.photo, caption: building.photoCaption, credit: building.photoCredit };
  const coverIndex = photos.findIndex(photo => photo.photo === cover.photo);
  const fullGallery = coverIndex < 0 ? [cover, ...photos] : photos;
  for (const button of app.querySelectorAll('#view-photo, #enlarge-photo')) {
    button.onclick = () => openPhotoGallery(building.name, fullGallery, Math.max(0, coverIndex));
  }
}

function openPhotoGallery(name, photos, initialSlide) {
  if (photoDialog.open) return;
  photoCarousel?.destroy();
  photoDialog.innerHTML = `
    <header class="photo-viewer-header">
      <span>${esc(t('gallery'))} <span aria-hidden="true">/</span> <strong>${esc(name)}</strong></span>
      <button type="button" class="photo-close" aria-label="${esc(t('closePhoto'))}" autofocus>${siteIcon('x', 24)}</button>
    </header>
    <div class="photo-viewer-body">
      <div class="photo-stage">
        <div class="swiper photo-carousel"><div class="swiper-wrapper">
          ${photos.map(({ photo, caption }, index) => `<div class="swiper-slide">
            <img src="${imageUrl(photo)}" alt="${esc(caption)}" loading="${index === initialSlide ? 'eager' : 'lazy'}" draggable="false">
          </div>`).join('')}
        </div></div>
        ${galleryControls()}
      </div>
      ${photos.length > 1 ? `<div class="photo-thumbnails" role="group" aria-label="${esc(t('gallery'))}">
        ${photos.map(({ photo, caption }, index) => `<button type="button" data-photo-index="${index}" aria-label="${index + 1} · ${esc(caption)}">
          <img src="${imageUrl(photo)}" alt="" loading="lazy">
        </button>`).join('')}
      </div>` : ''}
    </div>
    <footer class="photo-viewer-footer">
      <span class="photo-count" aria-live="polite"></span>
      <div class="photo-details"><strong></strong><small></small></div>
      <a class="photo-original" target="_blank" rel="noopener">${esc(t('originalPhoto'))}</a>
    </footer>`;

  const thumbnails = [...photoDialog.querySelectorAll('[data-photo-index]')];
  const count = photoDialog.querySelector('.photo-count');
  const caption = photoDialog.querySelector('.photo-details strong');
  const credit = photoDialog.querySelector('.photo-details small');
  const original = photoDialog.querySelector('.photo-original');
  function updatePhoto(swiper) {
    const index = swiper.activeIndex;
    const photo = photos[index];
    count.textContent = `${index + 1} / ${photos.length}`;
    caption.textContent = photo.caption;
    credit.textContent = photo.credit || '';
    original.href = photo.photo;
    thumbnails.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    thumbnails[index]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  }

  photoDialog.querySelector('.photo-close').onclick = () => photoDialog.close();
  photoDialog.showModal();
  photoCarousel = new Swiper(photoDialog.querySelector('.photo-carousel'), {
    initialSlide,
    speed: galleryMotion.matches ? 0 : 340,
    navigation: galleryNavigation(photoDialog),
    keyboard: { enabled: true },
    a11y: { prevSlideMessage: t('previousPhoto'), nextSlideMessage: t('nextPhoto') },
    on: { init: updatePhoto, slideChange: updatePhoto }
  });
  thumbnails.forEach((button, i) => { button.onclick = () => photoCarousel.slideTo(i); });
}

photoDialog.addEventListener('close', () => {
  if (photoDialog.open) return;
  photoCarousel?.destroy();
  photoCarousel = null;
  photoDialog.replaceChildren();
});
