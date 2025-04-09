// Nombre de la caché
const CACHE_NAME = "restaurant-app-v1"

// Archivos a cachear
const urlsToCache = [
  "/",
  "/index.php",
  "/assets/css/styles.css",
  "/assets/js/main.js",
  "/assets/js/menus.js",
  "/assets/js/staff.js",
  "/assets/js/orders.js",
  "/assets/js/sales.js",
  "/assets/img/placeholder.jpg",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js",
  "https://code.jquery.com/jquery-3.6.0.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css",
]

// Instalación del Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caché abierta")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Activación del Service Worker
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Estrategia de caché: Cache first, then network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Devuelve la respuesta cacheada si existe
      if (response) {
        return response
      }

      // Si no está en caché, busca en la red
      return fetch(event.request)
        .then((response) => {
          // Verifica que la respuesta sea válida
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clona la respuesta para poder guardarla en caché
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch((error) => {
          // Si la solicitud es para una página HTML, muestra la página offline
          if (event.request.mode === "navigate") {
            return caches.match("offline.html")
          }

          // Para otros recursos, simplemente muestra el error
          throw error
        })
    }),
  )
})

