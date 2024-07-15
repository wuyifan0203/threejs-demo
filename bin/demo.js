/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-07-09 20:33:06
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-15 21:40:02
 * @FilePath: /threejs-demo/bin/demo.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import * as puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import jimp from 'jimp';


console.red = msg => console.log(chalk.red(msg));
console.yellow = msg => console.log(chalk.yellow(msg));
console.green = msg => console.log(chalk.green(msg));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const idleTime = 9; // 9 seconds - for how long there should be no network requests
const networkTimeout = 5; // 5 minutes, set to 0 to disable
const parseTime = 6; // 1 MB / 6 seconds = 166 KB/s
const renderTimeout = 5; // 5 seconds, set to 0 to disable

const viewScale = 2;
const jpgQuality = 95;

(async () => {
  // 获取清页脚本代码
  const cleanPageScript = await fs.readFile(path.join(__dirname, '/cleanPage.js'), 'utf8');
  // 获取注入脚本代码
  const injectionScript = await fs.readFile(path.join(__dirname, '/injection.js'), 'utf8');

  const errorCache = []

  // Launch the browser 
  const browser = await puppeteer.launch({
    headless: false, // 设置为 false 以启用可视模式
    args: ['--disable-web-security', '--allow-file-access-from-files']
  });
  // open a new blank page
  const page = await browser.newPage();

  // Navigate the page to a URL



  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });


  try {
    await preparePage();
    await loadPage();
    await renderPage();
    await screenShot();
  } catch (error) {

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

  async function preparePage() {
    await page.evaluate(injectionScript);
    page.pageSize = 0;

    // 代理页面报错信息
    page.on('console', async (msg) => {
      const type = msg.type();

      if (type !== 'error' || type !== 'warning') return;

      const args = await Promise.all(msg.args().map(async arg => {
        try {
          return await arg.executionContext().evaluate(arg => arg instanceof Error ? arg.message : arg, arg);
        } catch (e) { // Execution context might have been already destroyed
          return arg;
        }
      }));

      let text = args.join(' '); // https://github.com/puppeteer/puppeteer/issues/3397#issuecomment-434970058

      text = text.trim();
      if (text === '') return;

      if (errorCache.includes(text)) return
      errorCache.push(text);

      if (type === 'warning') {
        console.yellow(text);
      } else {
        console.red(text);
      }

    })

    // 代理请求，统计页面资源大小
    page.on('request', async (response) => {
      try {
        if (response.status === 200) {
          await response.buffer().then(buffer => page.pageSize += buffer.length);
        }
      } catch { }
    })
  }

  async function loadPage() {
    try {
      await page.goto('http://localhost:6600/threejs-demo/src/animate/useAnimation.html', {
        waitUntil: ['networkidle0', 'load'],
        timeout: networkTimeout * 60000
      });
    } catch (error) {
      throw new Error(`Failed to navigate to URL: ${error}`);
    }
  }

  async function renderPage() {
    try {
      console.yellow('inject cleanPageScript');
      // 注入清理脚本 remove Status.js and GUI
      page.evaluate(cleanPageScript);
      console.green('cleanPageScript success');
      // 等待页面的网络空闲状态
      console.yellow('wait waitForNetworkIdle');
      await page.waitForNetworkIdle({
        timeout: networkTimeout * 60000,
        idleTime: idleTime * 1000
      });
      console.green('waitForNetworkIdle success');
      console.log(page.pageSize);
      console.yellow('wait render process');
      await page.evaluate(async (renderTimeout, parseTime) => {
        // 等待 parseTime 后 resolve
        await new Promise(resolve => setTimeout(resolve, parseTime));
        /* Resolve render promise */
        window._renderStarted = true;
        await new Promise(function (resolve, reject) {
          // 记录开始渲染时间
          const renderStart = performance._now();
          const waitingLoop = setInterval(function () {
            // 是否渲染了 5 秒
            const renderTimeoutExceeded = (renderTimeout > 0) && (performance._now() - renderStart > 1000 * renderTimeout);
            if (renderTimeoutExceeded) {
              clearInterval(waitingLoop);
              reject('Render timeout exceeded');
            } else if (window._renderFinished) {
              clearInterval(waitingLoop);
              resolve();
            }
          }, 10);
        });
      }, renderTimeout, page.pageSize / 1024 / 1024 / parseTime);
      console.green('render process success');
    } catch (error) {
      throw new Error(`Error happened while rendering file: ${error}`);
    }
  }

  async function screenShot() {
    const image = (await jimp.read(await page.screenshot())).scale(1 / viewScale).quality(jpgQuality);
    image.writeAsync(path.join(__dirname, 'screenshots/test.jpg'));
    console.green('screenShot success')
  }



})();