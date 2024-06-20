import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

import Utils from './functions.js'

export default class Browser {
  /**
   * @type {import('puppeteer').Browser}
   */
  browser = null
  /**
   * @type {import('puppeteer').Page}
   */
  page = null
  cookies = null
  headersLocal = {}
  set(headers = {}) {
    this.headersLocal = headers
  }

  async init() {
    puppeteer.use(StealthPlugin())
    const browser = await puppeteer.launch({
      // executablePath: '/usr/bin/chromium',
      // args: ['--no-sandbox', '--disable-dev-shm-usage'],
    })
    this.browser = browser
    await this.newPage()
  }

  async newPage() {
    const page = await this.browser.newPage()
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en',
    })
    page.setJavaScriptEnabled(true)
    this.page = page
  }

  async getContent(url, accessUrl = true) {
    if (accessUrl) {
      // await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36')
      if (!Utils.isEmpty(this.headersLocal)) {
        await this.page.setExtraHTTPHeaders(this.headersLocal)
        // await this.page.setRequestInterception(true)
        // this.page.on('request', async (request) => {
        //   const a = request.headers()
        //   for (const key in this.headersLocal) {
        //     a[key] = this.headersLocal[key]
        //   }
        //   request.continue({
        //     headers: a,
        //   })
        // })
      }
      await this.page.goto(url)
    }
    return this.page.content()
  }

  async getElement(selector) {
    return this.page.waitForSelector(selector, { visible: true })
  }

  async select(tag, value) {
    await this.page.select(tag, value)
    await this.page.waitForNavigation()
  }

  async click(selector = '') {
    try {
      await this.page.click(selector)
      return true
    } catch (error) {
      return false
    }
  }

  async close() {
    await this.browser.close()
  }
}
