let virtualFiles = {};

self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => self.clients.claim());

self.addEventListener("message", e => {
  if (e.data.type === "SET_FILES") {
    virtualFiles = e.data.files;
    e.ports[0].postMessage("FILES_READY");
  }
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const path = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;

  if (virtualFiles[path]) {
    e.respondWith(virtualFiles[path].arrayBuffer().then(buf => new Response(buf)));
  }
});
