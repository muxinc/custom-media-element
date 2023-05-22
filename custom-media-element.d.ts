
type Constructor = new (...args: any[]) => {};

export function CustomMediaMixin<TBase extends Constructor>(Base: TBase): any;

export class CustomAudioElement extends HTMLAudioElement implements HTMLAudioElement {
  static readonly observedAttributes: string[];
  readonly nativeEl: HTMLAudioElement;
  attributeChangedCallback(attrName: string, oldValue?: string | null, newValue?: string | null): void;
  connectedCallback(): void;
  disconnectedCallback(): void;
}

export class CustomVideoElement extends HTMLVideoElement implements HTMLVideoElement {
  static readonly observedAttributes: string[];
  readonly nativeEl: HTMLVideoElement;
  attributeChangedCallback(attrName: string, oldValue?: string | null, newValue?: string | null): void;
  connectedCallback(): void;
  disconnectedCallback(): void;
}
