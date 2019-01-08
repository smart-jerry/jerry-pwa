/**
 * Created by jerry on 2017/3/9.
 */
(function(){
	'use strict';
	var app = {

	};
	app.updateForecastCard = function(data) {
		var imgsrc=data.bannerList[0].imgUrl;console.log(imgsrc);
		var card='<img src="'+imgsrc+'">';
		var contain=document.getElementById("data-box");
		// Verifies the data provide is newer than what's already visible
		// on the card, if it's not bail, if it is, continue and update the
		// time saved in the card

		//如何区分数据请求和缓存请求哪个回来？
		if(data.created1){
			contain.setAttribute("create1",data.created1);
		}
		if(data.created2){
			contain.setAttribute("create2",data.created2);
		}
		var create1=contain.getAttribute("create1");
		var create2=contain.getAttribute("create2");
		if(create1 && create2){
			var data1=new Date(create1);
			var data2=new Date(create2);
			if (data2.getTime() < data1.getTime()) {//缓存返回时间小于请求返回时间就不刷新
				return;
			}
		}
		contain.innerHTML=card;
		/*var cardLastUpdatedElem = document.querySelector('.card-last-updated');
		var cardLastUpdated = cardLastUpdatedElem.textContent;
		if (cardLastUpdated) {
			cardLastUpdated = new Date(cardLastUpdated);
			// Bail if the card has more recent data then the data
			if (dataLastUpdated.getTime() < cardLastUpdated.getTime()) {
				return;
			}
		}
		cardLastUpdatedElem.textContent = data.created;*/
	};
	app.getForecast = function() {
		var url = './json/data_en.json';
		// TODO add cache logic here
		if ('caches' in window) {
			/*
			 * Check if the service worker has already cached this city's weather
			 * data. If the service worker has the data, then display the cached
			 * data while the app fetches the latest data.
			 */
			caches.match(url).then(function(response) {
				if (response) {
					response.json().then(function updateFromCache(json) {
						var results=json;
						results.created1 = new Date();
						app.updateForecastCard(results);
					});
				}
			});
		}
		// Fetch the latest data.
		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if (request.readyState === XMLHttpRequest.DONE) {
				if (request.status === 200) {
					var response = JSON.parse(request.response);
					response.created2 = new Date();
					app.updateForecastCard(response);
				}
			} else {
				// Return the initial weather forecast since no data is available.
				//app.updateForecastCard();//用假数据来构造
			}
		};
		request.open('GET', url);
		request.send();
	};

	document.getElementById('nav-btn').addEventListener('click', function() {
		app.getForecast();
	});

	//service-worker.js文件必须放在跟目录，因为 service workers 的作用范围是根据其在目录结构中的位置决定的。
	//检查servicewoker，注册一个serviceworker
	if('serviceWorker' in navigator) {
		navigator.serviceWorker
			.register('./service-worker.js')
			.then(function() { console.log('Service Worker Registered'); });
	}
})();