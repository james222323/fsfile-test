const DB_NAME = "fsgame_storage";
const STORE_NAME = "files";

self.addEventListener("install", e => { console.log("🛠️ SW installed"); self.skipWaiting(); });
self.addEventListener("activate", e => { console.log("🚀 SW activated"); e.waitUntil(clients.claim()); });

async function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore(STORE_NAME);
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}

async function getFile(path) {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME,"readonly");
    const req = tx.objectStore(STORE_NAME).get(path.replace(/^\.\//,''));
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>resolve(null);
  });
}

self.addEventListener("fetch", e => {
  e.respondWith((async () => {
    const url = new URL(e.request.url);
    const path = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
    const file = await getFile(path);
    if (file) {
      let type = "application/octet-stream";
      if (path.endsWith(".html")) type = "text/html";
      else if (path.endsWith(".js")) type = "text/javascript";
      else if (path.endsWith(".json")) type = "application/json";
      return new Response(file, { headers: { "Content-Type": type } });
    }
    return fetch(e.request);
  })());
});

self.addEventListener("message", e => {
  if(e.data.action==="reload-cache") console.log("♻️ SW cache refresh requested");
});
