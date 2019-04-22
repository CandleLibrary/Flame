self.addEventListener('install', function(event) {
  // Perform install steps
  console.log("INSTALLED!")
});

self.addEventListener('fetch', function(event) {
    return fetch(event.request);
});
