$(function () {
	const siteForParse = 'https://carry.ck.ua';
	const $preloader = $('#preloader');
	const $contentContainer = $('#resultbox');
	const $buttonParse = $('#starter');
	let allRestaurants = [];
	let debounceTimer;
	
	const debounce = (callback, time) => {
		window.clearTimeout(debounceTimer);
		debounceTimer = window.setTimeout(callback, time);
	};
	
	function openNewRastaurant(urlRest) {
		const fullUrl = siteForParse + urlRest;
		
		function addNewVal (data) {
			createObjectMenu(data, fullUrl);
		}
		
		ajaxSend(fullUrl, addNewVal, ajaxFail);
	}
	
	//create new object 'product' for arr menu
	function createObjectMenu (data, fullUrl) {
		const arrProductsData = $(data).find('.js-product');
		
		arrProductsData.each((index, item)=> {
			const image = $(item).find('.js-product-img').css('background-image');
			const name = $(item).find('.js-product-name').text();
			const price = Number($(item).find('.js-product-price').text());
			const sectionAnchor = $(item).parents('.t-rec').attr('id');
			
			const product = {
				product: {
					restaurantUrl: fullUrl,
					image: image,
					name: name,
					price: price,
					sectionAnchor: sectionAnchor
				}
			}
			
			allRestaurants.push(product);
		})
		
	debounce(renderDom, 1500);
	}
	
	function ajaxSend(url, doneFunction, failFunction) {
		let ajaxSend = $.ajax(url);
		ajaxSend.done(function (data) {
			doneFunction(data)
		});
		ajaxSend.fail(function (e, g, f) {
			failFunction()
		})
	}
	
	function ajaxLoaderStart() {
		$preloader.fadeIn();
		$buttonParse.attr('disabled', 'disable')
	}
	
	function ajaxLoaderStop() {
		$preloader.fadeOut();
		$buttonParse.removeAttr('disabled');
	}
	
	//ajax fail function
	function ajaxFail() {
		console.log('Epic Fail');
	}
	
	//start parse
	function parserGo() {
		ajaxLoaderStart();
		allRestaurants = [];
		$contentContainer[0].innerHTML = ' ';
		
		ajaxSend(siteForParse, analysisSites, ajaxFail)
	}
	
	//parse first level
	function analysisSites(data) {
		let parentLinkUrl;
		
		$(data).find('.t-name_lg').each(function () {
			const restaurantName = $(this).text()
			parentLinkUrl = $(this).parents('a').attr('href');
			openNewRastaurant(parentLinkUrl, restaurantName);
		})
	}
	
	//constructor dom element
	function createDishDomElement (objProduct) {
		const linkToProduct = `${objProduct.product.restaurantUrl}` + '#' + `${objProduct.product.sectionAnchor}`;
		const imageUrlSplit = objProduct.product.image.split('resizeb/');
		let lastPartImageUrlSplit, imageUrlNormalise;
		
		if (imageUrlSplit.length === 2) {
			lastPartImageUrlSplit = imageUrlSplit[1].split('/');
			if (lastPartImageUrlSplit.length === 2) imageUrlNormalise = `${imageUrlSplit[0]}` + 'resizeb/500x/' + `${lastPartImageUrlSplit[1]}`;
		}
		
		imageUrlNormalise? imageUrlNormalise = imageUrlNormalise : imageUrlNormalise = objProduct.product.image;
		
		const domElement = "" +
			`<a href='${linkToProduct}' target="_blank" class='dish btn btn__secondary'>` +
			`<div role='img' class='dish__image' style='background-image: ${imageUrlNormalise}'></div>` +
			`<div class='dish__description'>` +
			`<p class='dish__title'>${objProduct.product.name}</p>` +
			`<p class='dish__price'>${objProduct.product.price}грн</p>` + `</div>`
		
		return  domElement
	}
	
	function renderDom () {
		ajaxLoaderStop();
		let filterArrProducts = allRestaurants;
		let nameFilter = document.getElementById('name').value.toLowerCase();
		const priceFilter = Number(document.getElementById('price').value);
		const myObj = {price: priceFilter, name: nameFilter};
		const myObjKeys = Object.keys(myObj);
		
		//filter the array from dubbing
		filterArrProducts = [...new Map(filterArrProducts.map(item =>
			[item.product['name'], item])).values()];
		
		nameFilter = nameFilter + " ";
		
		//filter the array from your inputs
		if (priceFilter > 0 || nameFilter) {
			myObjKeys.forEach((key,index) => {
				filterArrProducts = filterArrProducts.filter((item) => {
					if (key === 'price' && myObj[key] > 0) { return item.product[key] <= myObj[key] }
					else if (key === 'name' && myObj[key]) { return item.product[key].toLowerCase().includes(myObj[key]) }
					else { return true }
				})
			})
		}
		
		//render dom
		for ( i in filterArrProducts) {
			$('#resultbox').append(createDishDomElement(filterArrProducts[i]));
		}
	}
	
	$buttonParse.click(parserGo);
	});

console.log("start app")