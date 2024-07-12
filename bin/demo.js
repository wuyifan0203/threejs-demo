/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-07-09 20:33:06
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-12 18:00:41
 * @FilePath: /threejs-demo/bin/demo.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import * as puppeteer from 'puppeteer';



(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false, // 设置为 false 以启用可视模式
    args: ['--disable-web-security', '--allow-file-access-from-files']
  });
  const page = await browser.newPage();

  // Navigate the page to a URL


  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });
  const networkTimeout = 5;
  try {
    await page.goto('http://localhost:6600/threejs-demo/src/animate/useAnimation.html', {
      waitUntil: ['networkidle0', 'load'],
      timeout: networkTimeout * 60000
    });
  } catch (error) {
    throw new Error(`Failed to navigate to URL: ${error}`);
  }



  // Type into search box
  // await page.type('.devsite-search-field', 'automate beyond recorder');

  // Wait and click on first result
  // const searchResultSelector = '.devsite-result-item-link';
  // await page.waitForSelector(searchResultSelector);
  // await page.click(searchResultSelector);

  // // Locate the full title with a unique string
  // const textSelector = await page.waitForSelector(
  //   'text/Customize and automate'
  // );
  // const fullTitle = await textSelector?.evaluate(el => el.textContent);

  // Print the full title
  // console.log('The title of this blog post is "%s".', fullTitle);

  // await browser.close();



})();