/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-07-09 20:33:06
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-07-16 21:07:57
 * @FilePath: /threejs-demo/bin/demo.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import * as puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import jimp from 'jimp';
import express from 'express';


class PromiseQueue {
  constructor(func, ...args) {
    this.func = func.bind(this, ...args);
    this.promises = [];
  }

  add(...args) {
    const promise = this.func(...args);
    this.promises.push(promise);
    promise.then(() => this.promises.splice(this.promises.indexOf(promise), 1));
  }

  async waitForAll() {
    console.log('begin', this.promises);
    while (this.promises.length > 0) {

      await Promise.all(this.promises);
    }
  }
}

console.red = msg => console.log(chalk.red(msg));
console.yellow = (...arg) => console.log(chalk.yellow(...arg));
console.green = msg => console.log(chalk.green(msg));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const idleTime = 9; // 9 seconds - for how long there should be no network requests
const networkTimeout = 5; // 5 minutes, set to 0 to disable
const parseTime = 6; // 1 MB / 6 seconds = 166 KB/s
const renderTimeout = 5; // 5 seconds, set to 0 to disable

const width = 400;
const height = 250;
const viewScale = 2;
const jpgQuality = 95;

const pageNum = 8;
const viewport = { width: width * viewScale, height: height * viewScale };
const browser = await puppeteer.launch({
  headless: false, // 设置为 false 以启用可视模式
  args: ['--disable-web-security', '--allow-file-access-from-files'],
  defaultViewport: viewport,
});

// 获取清页脚本代码
const cleanPageScript = await fs.readFile(path.join(__dirname, '/cleanPage.js'), 'utf8');
// 获取注入脚本代码
const injectionScript = await fs.readFile(path.join(__dirname, '/injection.js'), 'utf8');

const port = 6600;
const baseURL = '/threejs-demo';

const app = express();
app.use(baseURL, express.static(path.resolve()));
const server = app.listen(port, main);

const errorPages = [];

async function main() {
  const errorCache = []
  // 获取所有标签的href
  const urls = await getAnchorsHref();


  urls.length = 1
  const pages = await browser.pages();

  console.yellow('initialize pages');
  // 同时开启8个浏览器页面
  while (pages.length < pageNum && pages.length < urls.length) pages.push(await browser.newPage());
  console.green('initialize pages success');


  console.yellow('prepare pages');
  // 初始化页面
  for (const page of pages) await preparePage(page);

  console.green('prepare pages success');

  const queue = new PromiseQueue(pageCapture, pages);
  for (const url of urls) queue.add(url);

  await queue.waitForAll();

  console.yellow('errorPages')

  // close();
};


async function getAnchorsHref() {
  // open a new blank page
  const page = await browser.newPage();
  // await page.setViewport({ width: 1080, height: 1024 });
  await page.goto(`http://localhost:${port}${baseURL}/index.html`,{
    waitUntil: ['networkidle0', 'load'],
    timeout: networkTimeout * 60000
  });

  return await page.$$eval('a', (anchors) => anchors.map(anchor => anchor.href)).then(() => page.close());
}

async function preparePage(page) {
  await page.evaluateOnNewDocument(injectionScript);
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
  page.on('response', async (response) => {
    try {
      if (response.status() === 200 || response.status() === 304) {
        await response.buffer().then(buffer => page.pageSize += buffer.length);
      }
    } catch { }
  })

  page.url = undefined;

}

async function renderPage(page) {
  try {
    // 注入清理脚本 remove Status.js and GUI
    page.evaluate(cleanPageScript);
    // 等待页面的网络空闲状态
    await page.waitForNetworkIdle({
      timeout: networkTimeout * 60000,
      idleTime: idleTime * 1000
    });
    await page.evaluate(async (renderTimeout, parseTime) => {
      // 等待 parseTime 后 resolve
      await new Promise(resolve => setTimeout(resolve, parseTime));
      /* Resolve render promise */
      window._renderStarted = true;
      await new Promise(function (resolve) {
        // 记录开始渲染时间
        const renderStart = performance._now();
        const waitingLoop = setInterval(function () {
          // 是否渲染了 5 秒
          const renderTimeoutExceeded = (renderTimeout > 0) && (performance._now() - renderStart > 1000 * renderTimeout);
          if (renderTimeoutExceeded) {
            clearInterval(waitingLoop);
            // 不能reject 会阻塞整个page
            page.outTime = true;
            resolve();
          } else if (window._renderFinished) {
            clearInterval(waitingLoop);
            resolve();
          }
        }, 10);
      })
    }, renderTimeout, page.pageSize / 1024 / 1024 / parseTime);
  } catch (error) {
    throw new Error(`Error happened while rendering: ${error}`);
  }
}

async function pageCapture(pages, url) {
  // 找到空闲的page，以page.url为标志
  // console.log(page.url);
  const page = await new Promise((resolve) => {
    const interval = setInterval(() => {
      for (const page of pages) {
        if (page.url === undefined) {
          page.url = url; // acquire lock
          clearInterval(interval);
          resolve(page);
          break;
        }
      }
    }, 100);
  });

  console.log(page);

  try {
    // 初始化页面信息
    page.pageSize = 0;
    page.error = undefined;
    page.outTime = false;

    //  加载页面
    try {
      await page.goto(url, {
        waitUntil: ['networkidle0', 'load'],
        timeout: networkTimeout * 60000
      });
    } catch (error) {
      throw new Error(`Failed to navigate to URL: ${error}`);
    }

    console.log(`Navigated to ${url}`);
    // 渲染页面
    await renderPage(page);

    // 出错提前结束
    if (page.error !== undefined) throw new Error(page.error);
    // 截图
    const image = (await jimp.read(await page.screenshot())).scale(1 / viewScale).quality(jpgQuality);
    const fileName = url.match(/(\w+)\.html/)[1];
    image.writeAsync(path.join(__dirname, `../screenshots/${fileName}.jpg`));
    console.green(`screenShot success! : ${page.url}`)
  } catch (error) {
    console.red(`Error happened while capturing ${page.url}: ${error}`);
    errorPages.push(page.url)
  } finally {
    // 释放页面
    page.url = undefined;
  }
}

function close() {
  console.log('Closing...');
  browser.close();
  server.close();
  process.exit(1);

}