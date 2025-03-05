/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-07-09 20:33:06
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-05 17:53:59
 * @FilePath: \threejs-demo\bin\screenshot.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import * as puppeteer from "puppeteer";
import * as fsp from "node:fs/promises";
import * as fs from "node:fs";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";
import { Jimp } from "jimp";
import express from "express";
import pixelmatch from "pixelmatch";

import { list } from "../pageList.js";

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
    while (this.promises.length > 0) {
      await Promise.all(this.promises);
    }
  }
}

console.red = (...arg) => console.log(chalk.red(...arg));
console.yellow = (...arg) => console.log(chalk.yellow(...arg));
console.bgYellow = (...arg) => console.log(chalk.bgYellow(...arg));
console.green = (...arg) => console.log(chalk.green(...arg));
console.bgGreen = (...arg) => console.log(chalk.bgGreen(...arg));
console.blue = (...arg) => console.log(chalk.blue(...arg));
console.bgBlue = (...arg) => console.log(chalk.bgCyanBright(...arg));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const idleTime = 9; // 9 seconds - for how long there should be no network requests
const networkTimeout = 5; // 5 minutes, set to 0 to disable
const parseTime = 6; // 1 MB / 6 seconds = 166 KB/s
const renderTimeout = 5; // 5 seconds, set to 0 to disable

const width = 400;
const height = 250;
const viewScale = 2;
const imageQuality = 95;
const maxDifferentPixels = 0.3;
const pixelThreshold = 0.1; // threshold error in one pixel

const pageNum = 8;
const viewport = { width: width * viewScale, height: height * viewScale };
const browser = await puppeteer.launch({
  // headless: false, // 设置为 false 以启用可视模式
  args: [
    "--disable-web-security",
    "--allow-file-access-from-files",
    "--hide-scrollbars",
    "--enable-gpu",
  ],
  defaultViewport: viewport,
});

// 获取清页脚本代码
const cleanPageScript = await fsp.readFile(
  path.join(__dirname, "/cleanPage.js"),
  "utf8"
);
// 获取注入脚本代码
const injectionScript = await fsp.readFile(
  path.join(__dirname, "/injection.js"),
  "utf8"
);

const port = 6600;
const baseURL = "/threejs-demo";

const app = express();
app.use(baseURL, express.static(path.resolve()));
const server = app.listen(port, main);

const errorPages = [];

let total = 0;
let current = 0;

let generateLowImage = null;
let compareImage = null;

async function main() {
  // 获取所有标签的href
  let href = ['/composer/useOITRenderPass.html'];
  href = getAllHref();
  const urls = href.map(path => (`http://localhost:${port}${baseURL}/src${path}`));
  // urls.length = 1;

  total = urls.length;

  const pages = await browser.pages();

  console.yellow("initialize pages");
  // 同时开启8个浏览器页面
  while (pages.length < pageNum && pages.length < urls.length)
    pages.push(await browser.newPage());
  console.green("initialize pages success");

  console.yellow("prepare pages");
  // 初始化页面
  for (const page of pages) await preparePage(page);

  console.green("prepare pages success");

  const queue = new PromiseQueue(pageCapture, pages);
  for (const url of urls) queue.add(url);

  await queue.waitForAll();

  if (errorPages.length > 0) {
    console.yellow("errorPages", errorPages);
  }

  close();
}

function getAllHref() {
  const paths = new Set();
  list.forEach(({ pages }) => {
    pages.forEach(({ path }) => {
      paths.add(path);
    });
  });
  exceptionURLs.forEach((exceeded) => {
    paths.delete(exceeded);
  })

  return Array.from(paths);
}

async function preparePage(page) {
  await page.evaluateOnNewDocument(injectionScript);

  // 代理页面报错信息
  page.on("console", async (msg) => {
    const type = msg.type();

    if (type !== "error" || type !== "warning") return;

    const args = await Promise.all(
      msg.args().map(async (arg) => {
        try {
          return await arg
            .executionContext()
            .evaluate((arg) => (arg instanceof Error ? arg.message : arg), arg);
        } catch (e) {
          // Execution context might have been already destroyed
          return arg;
        }
      })
    );

    let text = args.join(" "); // https://github.com/puppeteer/puppeteer/issues/3397#issuecomment-434970058

    text = text.trim();
    if (text === "") return;

    if (errorCache.includes(text)) return;
    errorCache.push(text);

    if (type === "warning") {
      console.yellow(text);
    } else {
      console.red(text);
    }
  });

  // 代理请求，统计页面资源大小
  page.on("response", async (response) => {
    try {
      if (response.status() === 200 || response.status() === 304) {
        await response
          .buffer()
          .then((buffer) => (page.pageSize += buffer.length));
      }
    } catch { }
  });

  page.url = undefined;

  console.green("prepare page success");
}

async function renderPage(page) {
  try {
    // 注入清理脚本 remove Status.js and GUI
    await page.evaluate(cleanPageScript);
    // 等待页面的网络空闲状态
    await page.waitForNetworkIdle({
      timeout: networkTimeout * 60000,
      idleTime: idleTime * 1000,
    });

    const isWebGLContext =
      (await page.$$eval("#webgl-output", (elements) => elements.length)) > 0;

    await page.evaluate(() => {
      const playBtn = window.document.querySelector("#webgl-play");
      if (playBtn) playBtn.click();
    });

    if (!isWebGLContext) {
      console.red('this page is not webgl');
      await new Promise((resolve) => setTimeout(resolve, 200));
    } else {
      await page.evaluate(
        async (renderTimeout, parseTime) => {
          // 等待 parseTime 后 resolve
          await new Promise((resolve) => setTimeout(resolve, parseTime));
          /* Resolve render promise */
          window._renderStarted = true;
          await new Promise(function (resolve) {
            // 记录开始渲染时间
            const renderStart = performance._now();
            const waitingLoop = setInterval(function () {
              // 是否渲染了 5 秒
              const renderTimeoutExceeded =
                renderTimeout > 0 &&
                performance._now() - renderStart > 1000 * renderTimeout;
              if (renderTimeoutExceeded) {
                clearInterval(waitingLoop);
                // 不能reject 会阻塞整个page
                console.error("Render timeout exceeded");
                resolve();
              } else if (window._renderFinished) {
                clearInterval(waitingLoop);
                resolve();
              }
            }, 10);
          });
        },
        renderTimeout,
        page.pageSize / 1024 / 1024 / parseTime
      );
    }

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

  try {
    // 初始化页面信息
    page.pageSize = 0;
    page.error = undefined;
    page.outTime = false;

    //  加载页面
    try {
      await page.goto(url, {
        waitUntil: ["networkidle0"],
        timeout: networkTimeout * 60000,
      });
    } catch (error) {
      throw new Error(`Failed to navigate to URL: ${error}`);
    }

    console.blue(`Navigated to ${url}`, "pageSize:", page.pageSize);
    // 渲染页面

    await renderPage(page);

    // 出错提前结束
    if (page.error !== undefined) throw new Error(page.error);
    // 截图

    let image = null;
    try {
      const screenBuffer = await page.screenshot();
      const imageBuffer = Buffer.from(screenBuffer);
      image = await Jimp.read(imageBuffer);

      const scaleImage = image.scale(1 / viewScale);
      generateLowImage = await Jimp.read(
        await scaleImage.getBuffer("image/png", { quality: imageQuality })
      );
    } catch (error) {
      console.error("Error at Jimp processing:", error);
    }

    const fileName = url.match(/(\w+)\.html/)[1];

    const filePath = path.join(__dirname, `../screenshots/${fileName}.png`);

    try {
      if (fs.existsSync(filePath)) {
        const originImage = await Jimp.read(filePath);

        compareImage = await Jimp.read(
          await originImage.getBuffer("image/png", { quality: imageQuality })
        );

        const actual = generateLowImage.bitmap;
        const diff = compareImage.clone();

        const numDifferentPixels = pixelmatch(
          generateLowImage.bitmap.data,
          compareImage.bitmap.data,
          diff.bitmap.data,
          actual.width,
          actual.height,
          {
            threshold: pixelThreshold,
            alpha: 0.2,
          }
        );
        const differentPixels =
          (numDifferentPixels / (actual.width * actual.height)) * 100;
        if (differentPixels < maxDifferentPixels) {
          console.green(
            `Diff ${differentPixels.toFixed(
              1
            )}% in file: ${fileName} not change`
          );
        } else {
          await image.write(
            path.join(__dirname, `../screenshots/${fileName}.png`)
          );
          console.bgYellow(
            `Diff ${differentPixels.toFixed(
              1
            )}% in file  ~ [update] screenShot ${fileName} success!`
          );
        }
      } else {
        await image.write(filePath);
        console.bgGreen(
          `[new add] screenShot ${fileName} success! : ${page.url}`
        );
      }
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.red(`Error happened while capturing ${page.url}: ${error}`);
    errorPages.push(page.url);
  } finally {
    // 释放页面
    page.url = undefined;
    current++;
    console.bgBlue(
      `progress: ${current}/${total}  ${((current / total) * 100).toFixed(2)}%`
    );
  }
}

function close() {
  console.log("Closing...");
  browser.close();
  server.close();
  process.exit(1);
}

const exceptionURLs = ['/shader/audioContext.html', '/noise/terrainGenerate.html'];
