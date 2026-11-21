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

function archiveGallery(building) {
  if (!building.gallery?.length) return '';
  return `<div class="archive-gallery">
    <h3>${esc(t('gallery'))}</h3>
    <div class="archive-stage">
      <div class="swiper archive-carousel"><div class="swiper-wrapper">
      ${building.gallery.map(({ photo, caption, portraitRatio }, index) => `<figure class="swiper-slide${portraitRatio ? ' archive-portrait' : ''}"${portraitRatio ? ` style="--portrait-ratio: ${portraitRatio}"` : ''}>
        <button type="button" data-gallery-photo="${index}" aria-label="${esc(t('photoOf', { name: caption }))}">
          <img src="${imageUrl(photo)}" alt="${esc(caption)}" loading="lazy" draggable="false">
        </button>
      </figure>`).join('')}
      </div></div>
      ${building.gallery.length > 1 ? galleryControls() : ''}
    </div>
    ${building.gallery.length > 1 ? '<div class="swiper-scrollbar archive-scrollbar"></div>' : ''}
  </div>`;
}

function mountArchiveGallery(building, app) {
  const gallery = app.querySelector('.archive-gallery');
  const photos = building.gallery || [];
  if (gallery) {
    new Swiper(gallery.querySelector('.archive-carousel'), {
      slidesPerView: 'auto',
      centeredSlides: true,
      spaceBetween: 12,
      breakpoints: { 641: { spaceBetween: 18 } },
      grabCursor: true,
      speed: galleryMotion.matches ? 0 : 400,
      navigation: galleryNavigation(gallery),
      scrollbar: {
        el: gallery.querySelector('.archive-scrollbar'),
        draggable: true,
        hide: false,
        snapOnRelease: false
      },
      a11y: { prevSlideMessage: t('previousPhoto'), nextSlideMessage: t('nextPhoto') }
    });
    for (const button of gallery.querySelectorAll('[data-gallery-photo]')) {
      button.onclick = () => openPhotoGallery(building.name, photos, Number(button.dataset.galleryPhoto));
    }
  }

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
