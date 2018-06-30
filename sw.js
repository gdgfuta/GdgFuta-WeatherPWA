var cacheName = "WeatherPWA-cache-v1";
var dataCacheName = "WeatherData";
var filesToCahce = [
  "./",
  "./scripts/app.js",
  "./styles/inline.css",
  "./images/clear.png",
  "./images/cloudy-scattered-showers.png",
  "./images/cloudy.png",
  "./images/fog.png",
  "./images/ic_add_white_24px.svg",
  "./images/ic_refresh_white_24px.svg",
  "./images/partly-cloudy.png",
  "./images/rain.png",
  "./images/scattered-showers.png",
  "./images/sleet.png",
  "./images/snow.png",
  "./images/thunderstorm.png",
  "./images/wind.png"
];

self.addEventListener("install", e => {
  console.log("[Service worker] installed");
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log("[Service Worker] Caching app shell");
      return cache.addAll(filesToCahce);
    })
  );
});

self.addEventListener("activate", e => {
  console.log("[Service worker] activated");
  e.waitUntil(
    caches.keys().then(keyList => {
      Promise.all(
        keyList.map(key => {
          if (key !== cacheName && key !== dataCacheName) {
            console.log("[Service worker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", e => {
  console.log("[Service Worker] Fetching " + e.request.url);
  var dataUrl = "https://query.yahooapis.com/v1/public/yql";
  if (e.request.url.indexOf(dataUrl) > -1) {
    e.respondWith(
      caches.open(dataCacheName).then(cache => {
        return fetch(e.request).then(response => {
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(response => {
        return response || fetch(e.request);
      })
    );
  }
});
