const puppeteer = require('puppeteer');
const http = require('http');

(() => {
	const SITE_LINK = process.argv[2];
	var isDebug = false;
	
	if(!SITE_LINK) {
		console.log('Usage : node maps.js google-map-url');
		return;
	}
	
	if(process.argv[3] == '--debug') {
		isDebug = true;
	}
	
	
	const getTotalPhoto = () => {
		let xpathExpression = "//span[contains(@class, 'gm2-body-2') and string-length(text()) > 0]",
			el = document.evaluate(xpathExpression, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE);
			
		const totalPhoto = parseInt(el.singleNodeValue.textContent);
		
		return totalPhoto;
	};
	
	const scrollGallery = async () => {
		const gallery = document.querySelector('.section-layout.section-scrollbox.scrollable-y.scrollable-show'),
				loading = document.querySelector('.section-loading-spinner');
		let scrolling = true ,
			c = 0;
		
		while(scrolling) {
			gallery.scrollTo(0, gallery.scrollHeight);
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			scrolling = loading.parentElement.classList.contains('noprint') ;

			if(gallery.scrollHeight == 0 && c > 3) {
				break;
			}
			c++;
			console.log(c);
			console.log(scrolling);
			console.log(gallery.scrollHeight);
		}
	}
	
	(async () => {
		const browser = await puppeteer.launch({headless : !isDebug});
		const page = await browser.newPage();
		await page.goto(SITE_LINK);
		
		if(isDebug) {
			// show browser console on terminal
			page.on('console', consoleObj => console.log(consoleObj.text()));
		}
		await page.waitForSelector('.section-image-pack-image-container');
		
		await page.evaluate(() => {
			document.querySelector('.section-image-pack-image-container').click();
		});
		// await page.click('.section-image-pack-image-container'); // error on ubuntu server 16.04
		
		await page.waitForSelector('.gallery-image-high-res.loaded');
		await page.evaluate(scrollGallery);
		
		await page.waitFor(500); // wait for more than 1 gallery image loaded
		
		const img = await page.evaluate(() => {
			const gallery = document.querySelectorAll('.gallery-image-high-res.loaded');
			let imgs = [];
			gallery.forEach(photo => {
				let bgUrl = photo.style.backgroundImage;
				let url = bgUrl.substr(5).substr(0, bgUrl.length -7); // remove url('
				// url = url.substr(0, url.length - 2); // remove ')
				imgs.push(url);
			});
			
			return imgs;
		});
		
		console.log(img);
		await browser.close();
	})();
})();
