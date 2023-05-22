import { fixture, assert } from '@open-wc/testing';
import { CustomVideoElement } from '../custom-media-element.js';

// The custom-video-element JS import is defined in web-test-runner.config.js
// for both an eager and lazy custom element upgrade.

if (!globalThis.customElements.get('custom-video')) {
  globalThis.customElements.define('custom-video', CustomVideoElement);
}

it('is an instance of CustomVideoElement and HTMLElement', async function () {
  const customVideo = await fixture(`<custom-video></custom-video>`);
  assert(customVideo instanceof CustomVideoElement);
  assert(customVideo instanceof HTMLElement);
});

it('uses attributes for getters if nativeEl is not ready yet', async function () {
  class MyVideoElement extends CustomVideoElement {
    async load() {
      // This shows that the video like API can be delayed for players like
      // YouTube, Vimeo, Wistia, any player that requires an async load.
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    }
  }
  if (!globalThis.customElements.get('my-video')) {
    globalThis.customElements.define('my-video', MyVideoElement);
  }

  const customVideo = await fixture(
    `<my-video muted autoplay src="http://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/low.mp4"></my-video>`
  );

  assert.equal(customVideo.defaultMuted, true, 'defaultMuted is true');
  assert.equal(customVideo.autoplay, true, 'autoplay is true');
  assert.equal(
    customVideo.src,
    'http://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/low.mp4'
  );
});

it('has default video reflecting props', async function () {
  const customVideo = await fixture(
    `<custom-video></custom-video>`
  );

  customVideo.src = 'http://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/low.mp4';
  assert.equal(
    customVideo.getAttribute('src'),
    'http://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/low.mp4',
    'has src attribute'
  );
  assert.equal(
    customVideo.nativeEl.getAttribute('src'),
    'http://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/low.mp4',
    'nativeEl has src attribute'
  );

  customVideo.preload = 'none';
  assert.equal(customVideo.getAttribute('preload'), 'none', 'has preload attribute');
  assert.equal(customVideo.nativeEl.getAttribute('preload'), 'none', 'nativeEl has preload attribute');

  customVideo.defaultMuted = true;
  assert(customVideo.hasAttribute('muted'), 'has muted attribute');
  assert(customVideo.nativeEl.hasAttribute('muted'), 'nativeEl has muted attribute');

  customVideo.loop = true;
  assert(customVideo.hasAttribute('loop'), 'has loop attribute');
  assert(customVideo.nativeEl.hasAttribute('loop'), 'nativeEl has loop attribute');

  customVideo.autoplay = true;
  assert(customVideo.hasAttribute('autoplay'), 'has autoplay attribute');
  assert(customVideo.nativeEl.hasAttribute('autoplay'), 'nativeEl has autoplay attribute');

  customVideo.controls = true;
  assert(customVideo.hasAttribute('controls'), 'has controls attribute');
  assert(customVideo.nativeEl.hasAttribute('controls'), 'nativeEl has controls attribute');
});

it(`muted prop is set and doesn't reflect to muted attribute`, async function () {
  const customVideo = await fixture(
    `<custom-video></custom-video>`
  );

  customVideo.muted = true;

  assert(customVideo.muted, 'has muted true');
  assert(!customVideo.hasAttribute('muted'), 'has no muted attribute');
});

it('has a working muted attribute', async function () {
  if (document.readyState === 'loading') {
    await new Promise((resolve) => addEventListener('DOMContentLoaded', resolve));
  }

  const customVideo = window.customVideo;

  assert(customVideo.hasAttribute('muted'), 'has muted attribute');
  assert(customVideo.muted, 'has muted=true property');
  assert(
    customVideo.nativeEl.hasAttribute('muted'),
    'nativeEl has muted attribute'
  );
  assert(customVideo.nativeEl.muted, 'nativeEl has muted=true property');

  let playing;
  customVideo.addEventListener('playing', () => (playing = true));

  try {
    await customVideo.play();
  } catch (error) {
    console.warn(error);
  }

  assert(playing, 'playing event fired');
  assert(!customVideo.paused, 'paused prop is false');
});

it('adds and removes tracks and sources', async function () {
  if (document.readyState === 'loading') {
    await new Promise((resolve) => addEventListener('DOMContentLoaded', resolve));
  }

  const customVideo = window.customVideo;

  customVideo.innerHTML = `
    <track default label="English" kind="captions" srclang="en" src="../en-cc.vtt">
    <track label="thumbnails" id="customTrack" default kind="metadata" src="https://image.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/storyboard.vtt">
  `;

  await Promise.resolve();

  assert.equal(customVideo.querySelectorAll('track').length, 2);
  assert.equal(customVideo.textTracks.length, 2);

  customVideo.querySelector('track').remove();

  await Promise.resolve();

  assert.equal(customVideo.querySelectorAll('track').length, 1);
  assert.equal(customVideo.textTracks.length, 1);
});

it('has HTMLVideoElement like properties', async function () {
  const customVideo = await fixture(`<custom-video></custom-video>`);
  const customVideoElementProps = [
    'addEventListener',
    'addTextTrack',
    'autoplay',
    'buffered',
    'cancelVideoFrameCallback',
    'canPlayType',
    'captureStream',
    'controls',
    'controlsList',
    'crossOrigin',
    'currentSrc',
    'currentTime',
    'defaultMuted',
    'defaultPlaybackRate',
    'disablePictureInPicture',
    'disableRemotePlayback',
    'dispatchEvent',
    'duration',
    'ended',
    'error',
    'getVideoPlaybackQuality',
    'HAVE_CURRENT_DATA',
    'HAVE_ENOUGH_DATA',
    'HAVE_FUTURE_DATA',
    'HAVE_METADATA',
    'HAVE_NOTHING',
    'height',
    'load',
    'loop',
    'mediaKeys',
    'muted',
    'NETWORK_EMPTY',
    'NETWORK_IDLE',
    'NETWORK_LOADING',
    'NETWORK_NO_SOURCE',
    'networkState',
    'onencrypted',
    'onenterpictureinpicture',
    'onleavepictureinpicture',
    'onwaitingforkey',
    'pause',
    'paused',
    'play',
    'playbackRate',
    'played',
    'playsInline',
    'poster',
    'preload',
    'preservesPitch',
    'readyState',
    'remote',
    'removeEventListener',
    'requestPictureInPicture',
    'requestVideoFrameCallback',
    'seekable',
    'seeking',
    'setMediaKeys',
    'setSinkId',
    'sinkId',
    'src',
    'srcObject',
    'textTracks',
    'videoHeight',
    'videoWidth',
    'volume',
    'webkitAudioDecodedByteCount',
    'webkitDecodedFrameCount',
    'webkitDroppedFrameCount',
    'webkitEnterFullScreen',
    'webkitEnterFullscreen',
    'webkitExitFullScreen',
    'webkitExitFullscreen',
    'webkitVideoDecodedByteCount',
    'width',
  ];

  customVideoElementProps.forEach((prop) => {
    assert(
      prop in customVideo,
      `${prop} exists in an instance of CustomVideoElement`
    );
  });
});

it('has HTMLVideoElement like events', async function () {
  const customVideo = await fixture(`<custom-video></custom-video>`);
  const customVideoElementEvents = [
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

  customVideoElementEvents.forEach((event) => {
    assert(
      customVideo.constructor.Events.includes(event),
      `${event} exists in CustomVideoElement.Events`
    );
  });
});
