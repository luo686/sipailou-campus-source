'use strict';

const keylineIcons = {
  "building": ["xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"", "<path d=\"M7 2H17C18.65685 2 20 3.34315 20 5V19C20 20.65685 18.65685 22 17 22H7C5.34315 22 4 20.65685 4 19V5C4 3.34315 5.34315 2 7 2ZM10 22V20C10 18.89543 10.89543 18 12 18C13.10457 18 14 18.89543 14 20V22M9 6V8M15 6V8M9 12V14M15 12V14\"/>"],
  "puzzle": ["xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"", "<path d=\"M7 6L7 6.5C7 6.7761 6.7761 7 6.5 7L5 7C3.8954 7 3 7.8954 3 9L3 10.5C3 10.7761 3.2239 11 3.5 11L4 11C5.6569 11 7 12.3431 7 14C7 15.6569 5.6569 17 4 17L3.5 17C3.2239 17 3 17.2239 3 17.5L3 19C3 20.1046 3.8954 21 5 21L15 21C16.1046 21 17 20.1046 17 19L17 17.5C17 17.2239 17.2239 17 17.5 17L18 17C19.6569 17 21 15.6569 21 14C21 12.3431 19.6569 11 18 11L17.5 11C17.2239 11 17 10.7761 17 10.5L17 9C17 7.8954 16.1046 7 15 7L13.5 7C13.2239 7 13 6.7761 13 6.5L13 6C13 4.3431 11.6569 3 10 3C8.3431 3 7 4.3431 7 6Z\"/>"],
  "search": ["xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"", "<path d=\"M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10ZM15 15L21 21\"/>"],
  "maximize": ["xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"", "<path d=\"M9 3H6C4.34315 3 3 4.34315 3 6V9M15 3H18C19.65685 3 21 4.34315 21 6V9M21 15V18C21 19.65685 19.65685 21 18 21H15M3 15V18C3 19.65685 4.34315 21 6 21H9\"/>"],
  "x": ["xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"", "<path d=\"M7 7L17 17M17 7L7 17\"/>"],
  "arrow-left": ["xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"", "<path d=\"M19 12H5.94129M11.8771 5L5.17385 11.5875C4.94205 11.8153 4.94205 12.1847 5.17385 12.4125L11.8771 19\"/>"],
  "arrow-right": ["xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"", "<path d=\"M5 12H18.0587M12.1229 5L18.8261 11.5875C19.058 11.8153 19.058 12.1847 18.8261 12.4125L12.1229 19\"/>"],
  "arrow-up-right": ["xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"", "<path d=\"M6 6H17.5C17.77614 6 18 6.22386 18 6.5V18M7.2 16.8L17.4 6.6\"/>"],
  "plus": ["xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"", "<path d=\"M5 12H19M11.995 19.005V5.005\"/>"],
  "minus": ["xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"", "<path d=\"M5 12H19\"/>"],
  "crosshair": ["xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"", "<path d=\"M20 12C20 16.4183 16.4183 20 12 20C7.5817 20 4 16.4183 4 12C4 7.5817 7.5817 4 12 4C16.4183 4 20 7.5817 20 12ZM12 2L12 7M12 22L12 17M2 12L7 12M22 12L17 12\" fill=\"none\"/>"],
  "map-pin": ["xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"", "<path d=\"M17.962848 15.333333L12 22L6.037152 15.333333C4.725272 13.866607 4 11.96782 4 10C4 5.581722 7.581722 2 12 2C16.418278 2 20 5.581722 20 10C20 11.96782 19.274728 13.866607 17.962848 15.333333ZM15 10C15 11.6569 13.6569 13 12 13C10.3431 13 9 11.6569 9 10C9 8.3431 10.3431 7 12 7C13.6569 7 15 8.3431 15 10Z\"/>"]
};

function siteIcon(name, size = 16) {
  const [attributes, drawing] = keylineIcons[name];
  return `<svg class="keyline-icon" width="${size}" height="${size}" aria-hidden="true" focusable="false" ${attributes}>${drawing}</svg>`;
}

for (const placeholder of document.querySelectorAll('[data-keyline-icon]')) {
  placeholder.innerHTML = siteIcon(placeholder.dataset.keylineIcon, Number(placeholder.dataset.iconSize) || 16);
}
