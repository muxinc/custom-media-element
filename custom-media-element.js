/**
 * Custom Media Element
 * Based on https://github.com/muxinc/custom-video-element - Mux - MIT License
 *
 * The goal is to create an element that works just like the video element
 * but can be extended/sub-classed, because native elements cannot be
 * extended today across browsers.
 */

// The onevent like props are weirdly set on the HTMLElement prototype with other
// generic events making it impossible to pick these specific to HTMLMediaElement.
export const Events = [
  'abort',
  'canplay',
  'canplaythrough',
  'durationchange',
  'emptied',
  'encrypted',
  'ended',
  'error',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'pause',
  'play',
  'playing',
  'progress',
  'ratechange',
  'seeked',
  'seeking',
  'stalled',
  'suspend',
  'timeupdate',
  'volumechange',
  'waiting',
  'waitingforkey',
  'resize',
  'enterpictureinpicture',
  'leavepictureinpicture',
  'webkitbeginfullscreen',
  'webkitendfullscreen',
  'webkitpresentationmodechanged',
];

const styles = `
  :host {
    display: inline-block;
    line-height: 0;
  }

  video,
  audio {
    max-width: 100%;
    max-height: 100%;
    min-width: 100%;
    min-height: 100%;
  }
`;

export const template = globalThis.document?.createElement('template');
if (template) {
  template.innerHTML = `
  <style>
    ${styles}
  </style>
  <slot></slot>
  `;
}

/**
 * @see https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
 */
export const CustomMediaMixin = (superclass, { tag, is }) => {

  const nativeElTest = document.createElement(tag, { is });
  const nativeElProps = getNativeElProps(nativeElTest);

  return class CustomMedia extends superclass {
    static Events = Events;
    static template = template;
    static #isDefined;

    static get observedAttributes() {
      CustomMedia.#define();

      // Include any attributes from the custom built-in.
      const natAttrs = Object.getPrototypeOf(nativeElTest).observedAttributes;

      return [
        ...(natAttrs ?? []),
        'autopictureinpicture',
        'disablepictureinpicture',
        'disableremoteplayback',
        'autoplay',
        'controls',
        'controlslist',
        'crossorigin',
        'loop',
        'muted',
        'playsinline',
        'poster',
        'preload',
        'src',
      ];
    }

    static #define() {
      if (this.#isDefined) return;
      this.#isDefined = true;

      const propsToAttrs = new Set(this.observedAttributes);
      // defaultMuted maps to the muted attribute, handled manually below.
      propsToAttrs.delete('muted');

      // Passthrough native el functions from the custom el to the native el
      for (let prop of nativeElProps) {
        if (prop in this.prototype) continue;

        const type = typeof nativeElTest[prop];
        if (type == 'function') {
          // Function
          this.prototype[prop] = function (...args) {
            this.#init();

            const fn = () => {
              if (this.call) return this.call(prop, ...args);
              return this.nativeEl[prop].apply(this.nativeEl, args);
            };

            return fn();
          };
        } else {
          // Some properties like src, preload, defaultMuted are handled manually.

          // Getter
          let config = {
            get() {
              this.#init();

              let attr = prop.toLowerCase();
              if (propsToAttrs.has(attr)) {
                const val = this.getAttribute(attr);
                return val === null ? false : val === '' ? true : val;
              }

              return this.get?.(prop) ?? this.nativeEl?.[prop];
            },
          };

          if (prop !== prop.toUpperCase()) {
            // Setter (not a CONSTANT)
            config.set = function (val) {
              this.#init();

              let attr = prop.toLowerCase();
              if (propsToAttrs.has(attr)) {
                if (val === true || val === false || val == null) {
                  this.toggleAttribute(attr, Boolean(val));
                } else {
                  this.setAttribute(attr, val);
                }
                return;
              }

              if (this.set) {
                this.set(prop, val);
                return;
              }

              this.nativeEl[prop] = val;
            };
          }

          Object.defineProperty(this.prototype, prop, config);
        }
      }
    }

    #isInit;
    #nativeEl;

    constructor() {
      super();

      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.append(this.constructor.template.content.cloneNode(true));
      }

      // If the custom element is defined before the custom element's HTML is parsed
      // no attributes will be available in the constructor (construction process).
      // Wait until initializing in the attributeChangedCallback or
      // connectedCallback or accessing any properties.
    }

    get nativeEl() {
      return this.#nativeEl
        ?? this.shadowRoot.querySelector(tag)
        ?? this.querySelector(tag);
    }

    set nativeEl(val) {
      this.#nativeEl = val;
    }

    get defaultMuted() {
      return this.hasAttribute('muted');
    }

    set defaultMuted(val) {
      this.toggleAttribute('muted', Boolean(val));
    }

    get src() {
      return this.getAttribute('src');
    }

    set src(val) {
      this.setAttribute('src', `${val}`);
    }

    get preload() {
      return this.getAttribute('preload') ?? 'metadata';
    }

    set preload(val) {
      this.setAttribute('preload', `${val}`);
    }

    #init() {
      if (this.#isInit) return;
      this.#isInit = true;

      this.#initNativeEl();

      for (let prop of nativeElProps)
        this.#upgradeProperty(prop);

      // Keep some native child elements like track and source in sync.
      const childMap = new Map();
      // An unnamed <slot> will be filled with all of the custom element's
      // top-level child nodes that do not have the slot attribute.
      const slotEl = this.shadowRoot.querySelector('slot:not([name])');
      slotEl?.addEventListener('slotchange', () => {
        const removeNativeChildren = new Map(childMap);
        slotEl
          .assignedElements()
          .filter((el) => ['track', 'source'].includes(el.localName))
          .forEach((el) => {
            // If the source or track is still in the assigned elements keep it.
            removeNativeChildren.delete(el);
            // Re-use clones if possible.
            let clone = childMap.get(el);
            if (!clone) {
              clone = el.cloneNode();
              childMap.set(el, clone);
            }
            this.nativeEl.append?.(clone);
          });
        removeNativeChildren.forEach((el) => el.remove());
      });

      // The video events are dispatched on the CustomMediaElement instance.
      // This makes it possible to add event listeners before the element is upgraded.
      for (let type of Events) {
        this.shadowRoot.addEventListener?.(type, (evt) => {
          if (evt.target !== this.nativeEl) return;
          this.dispatchEvent(new CustomEvent(evt.type, { detail: evt.detail }));
        }, true);
      }
    }

    #upgradeProperty(prop) {
      // Sets properties that are set before the custom element is upgraded.
      // https://web.dev/custom-elements-best-practices/#make-properties-lazy
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        const value = this[prop];
        // Delete the set property from this instance.
        delete this[prop];
        // Set the value again via the (prototype) setter on this class.
        this[prop] = value;
      }
    }

    #initNativeEl() {
      // If there is no nativeEl by now, create it.
      if (!this.nativeEl) {
        // Neither Chrome or Firefox support setting the muted attribute
        // after using document.createElement.
        // Get around this by setting the muted property manually.
        const nativeEl = document.createElement(tag, { is });
        nativeEl.muted = this.hasAttribute('muted');

        this.shadowRoot.append(nativeEl);
      }
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
      // Initialize right after construction when the attributes become available.
      this.#init();
      this.#forwardAttribute(attrName, oldValue, newValue);
    }

    #forwardAttribute(attrName, oldValue, newValue) {
      // Ignore a few that don't need to be passed.
      if (['id', 'class'].includes(attrName)) {
        return;
      }

      if (newValue === null) {
        this.nativeEl.removeAttribute?.(attrName);
      } else {
        this.nativeEl.setAttribute?.(attrName, newValue);
      }
    }

    connectedCallback() {
      this.#init();
    }
  };
};

function getNativeElProps(nativeElTest) {
  // Map all native element properties to the custom element
  // so that they're applied to the native element.
  // Skipping HTMLElement because of things like "attachShadow"
  // causing issues. Most of those props still need to apply to
  // the custom element.
  let nativeElProps = [];

  // Walk the prototype chain up to HTMLElement.
  // This will grab all super class props in between.
  // i.e. VideoElement and MediaElement
  for (
    let proto = Object.getPrototypeOf(nativeElTest);
    proto && proto !== HTMLElement.prototype;
    proto = Object.getPrototypeOf(proto)
  ) {
    nativeElProps.push(...Object.getOwnPropertyNames(proto));
  }

  return nativeElProps;
}

export const CustomVideoElement = globalThis.document ? CustomMediaMixin(HTMLElement, { tag: 'video' }) : class {};

export const CustomAudioElement = globalThis.document ? CustomMediaMixin(HTMLElement, { tag: 'audio' }) : class {};
