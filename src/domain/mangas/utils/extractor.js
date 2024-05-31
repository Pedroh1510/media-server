import AdmZip from 'adm-zip'
import axios from 'axios'
import { load } from 'cheerio'
import { setTimeout } from 'node:timers/promises'

import logger from '../../../utils/logger.js'
import DownloadImageService from '../../shared/downloadImg.js'
import Browser from './browser.js'

export default class Extractor {
  downloadService = new DownloadImageService()
  /**
   * @typedef {{name:String,link:String}} Image
   * @param {Image[]} images
   */
  async download(images, headers = {}) {

    await Promise.all(
      images.map((image) => {
        const process = async () => {
          image.buffer = await this.downloadService.getBuffer(image.link, headers)
        }
        return process()
      })
    )
    const zip = new AdmZip()
    for (const image of images) {
      zip.addFile(image.name, image.buffer)
    }

    return zip.toBuffer()
  }

  getNextUrl(divNextPage, numberPage) {
    if (!divNextPage) return {}
    if (numberPage) {
      let isNextUrl = false
      for (const item of divNextPage) {
        if (!item.children.length) continue
        let link = null
        let page = null
        if (item.name === 'li') {
          link = item.children[0].attribs.href
          page = item.children[0].children[0].data
        } else {
          link = item.attribs.href
          if (item.children[0].name === 'span') {
            page = item.children[0].children[0].data?.trim()
          } else {
            page = item.children[0].data?.trim()
          }
        }
        if (page === numberPage?.trim()) {
          if (!isNextUrl) {
            isNextUrl = true
            continue
          }
        }
        if (!isNextUrl) continue
        let nextPage = page
        if (!page) {
          nextPage = `${parseInt(numberPage) + 1}`
        }
        return {
          nextUrl: link,
          numberPage: nextPage,
        }
      }
      return {}
    }
    return {
      nextUrl: divNextPage.length ? divNextPage[0].attribs.href : null,
    }
  }

  async getAllMangasApi({
    url = '',
    baseUrl = '',
    api = {
      pageLimit: 1,
      pageKey: 'page',
      properties: {},
    },
    selectors = {
      nextPage: '',
      content: '',
      numberPage: null,
      nextButton: '',
    },
  }) {
    // const browser = new Browser()

    // await browser.init()
    // await browser.getContent(url)
    const listMangas = []
    for (let index = 1; index < api.pageLimit; index++) {
      logger.info(`page: ${index}`)
      const content = await axios
        .get(url, {
          ...api.properties,
          params: {
            [api.pageKey]: index,
          },
        })
        .then((response) => response.data)
        .catch((e) => {
          return null
        })
      if (!content) break
      // const content = await browser.getContent(url, false)
      // await browser.getElement(selectors.content)
      // const data = await page.buffer();
      const html = load(content.toString())

      const listContent = html(selectors.content)
      if (!listContent?.length) {
        break
      }
      for (const item of listContent) {
        try {
          const manga = {
            link: item.attribs.href,
            name: item.attribs.title,
          }
          if (!manga.name || !manga.link) continue
          listMangas.push(manga)
        } catch (error) { }
      }
      // hasNextPage = await browser.click(selectors.nextButton)
      await setTimeout(100)
    }
    // return listMangas.concat(await getUrls(`${baseUrl}${nextUrl}`))
    return listMangas
  }

  async getAllMangas({
    url = '',
    baseUrl = '',
    api,
    selectors = {
      nextPage: '',
      content: '',
      numberPage: null,
    },
    browserContent = {
      headers: {},
    },
  }) {
    if (api) return this.getAllMangasApi({ url, baseUrl, api, selectors })
    const browser = new Browser()
    await browser.init()

    if (browserContent?.headers) {
      browser.set(browserContent?.headers)
    }
    let numberPage = selectors.numberPage
    const getUrls = async (url) => {
      logger.info(url)
      const content = await browser.getContent(url)
      // const data = await page.buffer();
      // const ppp = content.toString()
      // await writeFile('./test.html', ppp)
      const html = load(content.toString())
      const divNextPage = html(selectors.nextPage)
      const a = this.getNextUrl(divNextPage, numberPage)
      const nextUrl = a.nextUrl
      numberPage = a.numberPage

      const listContent = html(selectors.content)
      const listContentName = html(selectors.contentName)
      const listMangas = []
      for (let index = 0; index < listContent.length; index++) {
        const item = listContent[index]
        const itemName = selectors.contentName ? listContentName[index] : item
        // for (const item of listContent) {
        try {
          const link = item.attribs.href
            ? item.attribs.href.includes(baseUrl)
              ? item.attribs.href
              : `${baseUrl}${item.attribs.href}`
            : null
          const manga = {
            link,
            name: itemName.children[0].data,
          }
          if (!manga.name || !manga.link) continue
          listMangas.push(manga)
        } catch (error) { }
      }
      if (!nextUrl) return listMangas
      for (let index = 0; index < 3; index++) {
        try {
          await setTimeout(100)
          return listMangas.concat(await getUrls(`${baseUrl}${nextUrl}`))
        } catch (error) {
          await setTimeout(1000)
          logger.warn(`retry ${index}`)
        }
      }
      return listMangas
    }
    const mangas = await getUrls(url)
    await browser.close()
    return mangas
  }

  async listEp({
    url = '',
    baseUrl = '',
    api = '',
    selectors = { ep: '', epName: '', moreEp: '', numberPageEp: '', nextPageEp: '' },
    browserContent = { headers: {} },
  }) {
    // if (api) return listEpByAxios({ baseUrl, selectors, url, api })
    const browser = new Browser()
    await browser.init()

    const listEp = []
    do {
      logger.info(`page ${url}`)
      for (let index = 0; index < 3; index++) {
        try {
          if (browserContent?.headers) {
            browser.set(browserContent?.headers)
          }
          let page = await browser.getContent(url)
          if (selectors.moreEp) {
            await browser.click(selectors.moreEp)
            page = await browser.getContent(url, !selectors.moreEp)
          }
          const html = load(page.toString())
          // await writeFile('./test.html', page.toString())
          const epsSelecteds = html(selectors.ep)
          const epsNameSelecteds = html(selectors.epName)
          for (let index = 0; index < epsSelecteds.length; index++) {
            const epSelected = epsSelecteds[index]
            let name = epSelected.children[0].data
            if (selectors.epName) {
              const epNameSelected = epsNameSelecteds[index]
              name = epNameSelected.children[0].data
            }
            const link = epSelected.attribs.href
              ? epSelected.attribs.href.includes(baseUrl)
                ? epSelected.attribs.href
                : `${baseUrl}${epSelected.attribs.href}`
              : null
            const ep = {
              link,
              name,
            }
            listEp.push(ep)
          }
          const nextUrlDib = html(selectors.nextPageEp)
          const a = this.getNextUrl(nextUrlDib, selectors.numberPageEp)
          url = a?.nextUrl ? `${baseUrl}${a?.nextUrl}` : null
          selectors.numberPageEp = a?.numberPage
          break
        } catch (error) {
          logger.warn(`retry ${index}`)
        }
      }
    } while (url)
    await browser.close()
    return listEp.map((ep) => ({ ...ep, name: ep.name.replace(/\n/g, '').trim() }))
  }

  async listImageByEp({ epUrl = '', selectors = { image: '', selectMode: '' }, browserContent = { headers: {} } }) {
    const browser = new Browser()
    await browser.init()
    if (browserContent?.headers) {
      browser.set(browserContent?.headers)
    }

    const listImage = []
    for (let index = 0; index < 10; index++) {
      try {
        await browser.getContent(epUrl)
        if (selectors?.selectMode) {
          await browser.select(selectors.selectMode.key, selectors.selectMode.value)
        }
        const page = await browser.getContent(epUrl, false)
        // await writeFile('./test.html', page.toString())
        const html = load(page.toString())
        const imageSelecteds = html(selectors.image)
        for (let index = 0; index < imageSelecteds.length; index++) {
          const image = imageSelecteds[index]
          const img = image.attribs['data-src'] ?? image.attribs.src
          listImage.push(img)
        }
        break
      } catch (error) {
        logger.warn(`retry ${index}`)
      }
    }
    await browser.close()
    return listImage
  }
}
