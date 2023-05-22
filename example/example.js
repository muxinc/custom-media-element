import { CustomVideoElement } from '../custom-media-element.js';

class MyVideoElement extends CustomVideoElement {
  constructor() {
    super();
  }
}

if (globalThis.customElements && !globalThis.customElements.get('my-custom-video')) {
  globalThis.customElements.define('my-video', MyVideoElement);
}

export default MyVideoElement;
