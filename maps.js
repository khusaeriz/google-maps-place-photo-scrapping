const puppeteer = require('puppeteer');
const http = require('http');

(() => {
	const SITE_LINK = process.argv[2];
	
	if(!SITE_LINK) {
		console.log('Usage : node maps.js google-map-url');
		return;
	}
	
	const getTotalPhoto = () => {
		let xpathExpression = "//span[contains(@class, 'gm2-body-2') and string-length(text()) > 0]",
			el = document.evaluate(xpathExpression, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE);
			
		const totalPhoto = parseInt(el.singleNodeValue.textContent);
		
		return totalPhoto;
	};
	
	(async () => {
		const browser = await puppeteer.launch({headless : false});
		const page = await browser.newPage();
		await page.goto(SITE_LINK);
		await page.waitForSelector('.section-image-pack-image-container');
		
		await page.evaluate(() => {
			document.querySelector('.section-image-pack-image-container').click();
		});
		// await page.click('.section-image-pack-image-container'); // error on ubuntu server 16.04
		
		await page.waitForSelector('.gallery-image-high-res.loaded');
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
			
			console.log(imgs);
			return imgs;
		});
		
		console.log(JSON.stringify(img));
		await browser.close();
	})();
})();
