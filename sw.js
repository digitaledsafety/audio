---
layout: none
---
const CACHE_NAME = 'audio-cache-v1';
const urlsToCache = [
  '{{ site.baseurl }}/',
  '{{ site.baseurl }}/manifest.json',
  '{{ site.baseurl }}/icons/icon-192x192.png',
  '{{ site.baseurl }}/icons/icon-512x512.png',
  '{{ site.baseurl }}/showcase.html',
  '{{ site.baseurl }}/assets/js/mini-notation-parser.js',
  '{{ site.baseurl }}/assets/js/audio-worklets/bitcrusher-processor.js',
  '{{ site.baseurl }}/assets/js/audio-worklets/granular-processor.js',
  '{{ site.baseurl }}/assets/js/audio-worklets/quantizer-processor.js',
  '{{ site.baseurl }}/assets/js/audio-worklets/vocoder-processor.js',
  'https://cdn.digitaleducationsafety.org/packages/tailwindcss@3.4.17/tailwindcss.js',
  'https://cdn.digitaleducationsafety.org/packages/rete@2.0.6/rete.min.js',
  'https://cdn.digitaleducationsafety.org/packages/react-is@18.3.1/react-is.production.min.js',
  'https://cdn.digitaleducationsafety.org/packages/react@18.3.0/react.production.min.js',
  'https://cdn.digitaleducationsafety.org/packages/styled-components@6.1.19/styled-components.js',
  'https://cdn.digitaleducationsafety.org/packages/react-dom@18.3.1/react-dom.production.min.js',
  'https://cdn.digitaleducationsafety.org/packages/rete-area-plugin@2.1.5/rete-area-plugin.min.js',
  'https://cdn.digitaleducationsafety.org/packages/rete-render-utils@2.0.0-beta.10/rete-render-utils.min.js',
  'https://cdn.digitaleducationsafety.org/packages/rete-react-render-plugin@2.0.0-beta.9/rete-react-render-plugin.min.js',
  'https://cdn.digitaleducationsafety.org/packages/rete-connection-plugin@2.0.5/rete-connection-plugin.min.js',
  'https://cdn.digitaleducationsafety.org/packages/rete-context-menu-plugin@2.0.6/rete-context-menu-plugin.min.js',
  'https://cdn.digitaleducationsafety.org/packages/rete-engine@2.1.1/rete-engine.min.js',
  'https://cdn.digitaleducationsafety.org/packages/peerjs@1.5.5/peerjs.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Skip caching for non-GET requests or unsupported protocols
  if (event.request.method !== 'GET' || !['http:', 'https:'].includes(requestUrl.protocol)) {
    return; // Do not attempt to cache
  }

  event.respondWith(
    fetch(event.request).then(response => {
      // Check if we received a valid response to cache.
      if (!response || response.status !== 200) {
        return response;
      }

      const responseToCache = response.clone();

      caches.open(CACHE_NAME)
        .then(cache => {
          cache.put(event.request, responseToCache);
        });

      return response;
    }).catch(() => {
      // If the network request fails, try to get it from the cache.
      return caches.match(event.request);
    })
  );
});
