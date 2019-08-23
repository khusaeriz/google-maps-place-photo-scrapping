const puppeteer = require('puppeteer');
const http = require('http');

(() => {
	const SITE_LINK = process.argv[2];
	
	if(!SITE_LINK) {
		console.log('Usage : node maps.js google-map-url');
		return;
	}
	
	const getTotalPhoto = () => {
		const totalPhoto = parseInt(document.querySelector('.gm2-body-2').innerHTML);
		console.log(totalPhoto);
		return totalPhoto;
	};
	
	const scrapInfiniteScrollItems = async(page, scrollDelay = 100) => {
		
	}
	
	(async () => {
		const browser = await puppeteer.launch({headless : false});
		const page = await browser.newPage();
		await page.goto(SITE_LINK);
		await page.waitForSelector('.section-image-pack-image-container');
		
		console.log(await page.evaluate(getTotalPhoto));
		await page.evaluate(() => {
			document.querySelector('.section-image-pack-image-container').click();
		});
		// await page.click('.section-image-pack-image-container');
		await page.waitForSelector('.gallery-image-high-res.loaded');
		await page.waitFor(500);
		
		const img = await page.evaluate(() => {
			const gallery = document.querySelectorAll('.gallery-image-high-res.loaded');
			let imgs = [];
			gallery.forEach(foto => {
				let bgUrl = foto.style.backgroundImage;
				let url = bgUrl.substr(5);
				url = url.substr(0, url.length - 2);
				imgs.push(url);
			});
			
			console.log(imgs);
			return imgs;
		});
		
		console.log(JSON.stringify(img));
		// await browser.close();
	})();
})();
