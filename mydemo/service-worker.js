/**
 * Created by jerry on 2017/3/9.
 * https://developers.google.com/web/fundamentals/getting-started/codelabs/your-first-pwapp/#progressive_web_app
 */
var cacheName = 'myDemo-1';//应用外壳资源
var dataCacheName = 'weatherData-v1';//应用数据缓存资源
//app shell 需要缓存的文件列表
var filesToCache = [
	'/',
	'./index.html',
	'./js/app.js',
	'./manifest.json',
	'./css/index.css',
	'./images/banner_01.jpg',
	'./images/banner_02.jpg',
	'./images/banner_03.jpg',
	'./images/banner_04.jpg',
	'./images/icons/icon-32x32.png',
	'./images/icons/icon-128x128.png',
	'./images/icons/icon-144x144.png',
	'./images/icons/icon-152x152.png',
	'./images/icons/icon-192x192.png',
	'./images/icons/icon-256x256.png'
];
//当 service worker 被注册以后，当用户首次访问页面的时候一个 install 事件会被触发
self.addEventListener('install', function(e) {
	console.log('[ServiceWorker] Install111');
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			console.log('[ServiceWorker] Caching app shell');
			return cache.addAll(filesToCache);//缓存所以应用需要再次用到的资源
			//小bug：cache.addAll() 是原子操作，如果某个文件缓存失败了，那么整个缓存就会失败！
		})
	);
});

//当 service worker 开始启动时，这将会发射activate事件。
self.addEventListener('activate', function(e) {
	console.log('[ServiceWorker] Activate888');
	e.waitUntil(
		caches.keys().then(function(keyList) {
			return Promise.all(keyList.map(function(key) {
				console.log('[ServiceWorker] Removing old cache', key);
				if (key !== cacheName && key !== dataCacheName) {//清理外壳（app shell）缓存，不影响数据缓存
					return caches.delete(key);
				}
			}));
		})
	);
});

// service worker激活
self.addEventListener('active', function(e) {
	console.log('Service Worker is active 11111.');
});


//从缓存中加载 app shell(缓存的文件)
/*self.addEventListener('fetch', function(e) {
	console.log('[ServiceWorker] Fetch', e.request.url);
	e.respondWith(
		caches.match(e.request).then(function(response) {
			return response || fetch(e.request);
		})
	);
});*/
self.addEventListener('fetch', function(e) {
	console.log('[ServiceWorker] Fetch 2222', e.request.url);
	//var dataUrl = 'http://192.168.3.33:2015';
	var dataUrl="http://127.0.0.1:8887/mydemo/json";//请求服务端地址
//	console.log(dataUrl);
	if (e.request.url.indexOf(dataUrl) === 0) {console.log(1);
		// Put data handler code here
		e.respondWith(
			fetch(e.request)
				.then(function(response) {
					return caches.open(dataCacheName).then(function(cache) {
						cache.put(e.request.url, response.clone());
						console.log('[ServiceWorker] Fetched&Cached Data');
						return response;
					});
				})
		);
	} else {console.log(2);
		e.respondWith(
			caches.match(e.request).then(function(response) {
				return response || fetch(e.request);
			})
		);
	}
});