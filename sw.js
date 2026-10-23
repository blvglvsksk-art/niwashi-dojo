// 庭師道場のサービスワーカー：一度開けば、ネットがなくても動くようにする
const VERSION = "cd3074bf0c";
const CORE = "niwashi-core-" + VERSION;   // 画面・フォント・老師・参考写真（最初にまとめて保存）
const TREES = "niwashi-trees";            // 樹木の写真（見たものから順に保存。版が変わっても残す）
const PRECACHE = ["./", "index.html", "manifest.webmanifest", "chara/k_dere.webp", "chara/k_ikari.webp", "chara/k_mimamori.webp", "chara/k_odoroki.webp", "chara/k_oshie.webp", "chara/k_rei.webp", "chara/k_shinpai.webp", "fonts/ShipporiMinchoB1-ExtraBold.woff2", "fonts/ShipporiMinchoB1-SemiBold.woff2", "fonts/ZenKakuGothicNew-Black.woff2", "fonts/ZenKakuGothicNew-Bold.woff2", "fonts/ZenKakuGothicNew-Medium.woff2", "fonts/ZenKakuGothicNew-Regular.woff2", "fonts/fonts.css", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "refs/aeration.jpg", "refs/akahoshi.jpg", "refs/akahoshi2.jpg", "refs/byodoin.jpg", "refs/chadokuga.jpg", "refs/chainsaw.jpg", "refs/katsura.jpg", "refs/kenrokuen.jpg", "refs/koetsujigaki.jpg", "refs/komomaki.jpg", "refs/korai.jpg", "refs/koshosagyo.jpg", "refs/kutsunugi.jpg", "refs/matsukamikiri.jpg", "refs/nobedan.jpg", "refs/numazugaki.jpg", "refs/oribedoro.jpg", "refs/perlite.jpg", "refs/roji.jpg", "refs/ryoanji.jpg", "refs/saihoji.jpg", "refs/shichu.jpg", "refs/shirohitori.jpg", "refs/shuronawa.jpg", "refs/stourhead.jpg", "refs/susubyo.jpg", "refs/tamaryu.jpg", "refs/tenguso.jpg", "refs/tenryuji.jpg", "refs/tobiishi.jpg", "refs/tsukubai.jpg", "refs/udonko.jpg", "refs/versailles.jpg", "refs/yotsume2.jpg", "refs/yotsumegaki.jpg", "refs/yukimidoro.jpg", "refs/yukitsuri.jpg"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CORE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("niwashi-core-") && k !== CORE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const url = new URL(req.url);
  // 画面本体は「ネット優先・だめなら保存分」→ 更新がすぐ届き、圏外でも開ける
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CORE).then(x => x.put("index.html", c)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  // それ以外は「保存分優先」。樹木の写真は初めて見たときに保存する
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok && url.pathname.includes("/trees/")) { const c = r.clone(); caches.open(TREES).then(x => x.put(req, c)); }
    return r;
  })));
});
