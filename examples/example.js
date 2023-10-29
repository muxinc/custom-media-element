import { CustomVideoElement } from '../custom-media-element.js';

class MyVideoElement extends CustomVideoElement {}

if (globalThis.customElements && !globalThis.customElements.get('my-video')) {
  globalThis.customElements.define('my-video', MyVideoElement);
}

export default MyVideoElement;
