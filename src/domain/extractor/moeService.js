import { load } from 'cheerio'

import { moeApi } from '../../infra/service/apiService.js'
import { acceptedTags } from '../../utils/constants.js'
import logger from '../../utils/logger.js'
import ExtractorRepository from './extractorRepository.js'
import NyaaService from './nyaaService.js'

export default class MoeService {
  #nyaaService = new NyaaService()
  constructor() {
    this.acceptedTags = acceptedTags
    this.repository = new ExtractorRepository()
  }

  /**
   *
   * @param {string} url
   * @returns {Promise<{nextUrl: string, listVerify: string[], listData: {title: string, link: string, pubDate: string, hour: string}[]}>}>}
   */
  async #process(url) {
    const page = await moeApi.get(url).then((res) => res.data)
    const html = load(page)
    const pageDate = html('body > h3').text()
    const blocks = html('body > div')

    const listData = []
    const listVerify = []
    const isAccept = (text) => this.acceptedTags.some((tag) => text.toLowerCase().includes(tag))
    // const isVerify = (data) => this.#nyaaService.isVerify(data)
    blocks.each(function () {
      const hour = html(this).text()
      const pageTags = html(this).find('a')
      const paragraphs = pageTags
        .map((_, e) => {
          if (e.attribs?.href && e.attribs.href.includes('magnet')) {
            return e.attribs?.href
          }
          if (e.children.length > 0 && e.children[0]?.data) {
            return e.children[0]?.data
          }
          return null
        })
        .toArray()
        .filter((e) => e !== null)
      if (paragraphs.length !== 2) {
        return
      }
      if (paragraphs[1].trim() === '') {
        return
      }
      const text = paragraphs[1].toLowerCase()
      if (isAccept(text)) {
        listData.push({
          title: paragraphs[1],
          link: paragraphs[0],
          pubDate: pageDate,
          hour,
        })
        return
      }
      // if (isVerify(text)) {
      // eslint-disable-next-line array-callback-return
      pageTags.map((_, item) => {
        if (item.attribs?.href && item.attribs.href.startsWith('/torrent/')) {
          listVerify.push(item.attribs.href)
        }
      })
      // }
    })
    const nextUrl = html('body > p:nth-child(3) > a:nth-child(2)').attr('href')
    return { nextUrl, listData, listVerify }
  }

  async #processPageItem(uri) {
    try {
      const page = await moeApi.get(uri).then((res) => res.data)
      const html = load(page)
      const title = html('body > p:nth-child(2) > b').text()
      const pageDate = html('body > p:nth-child(4)').text()
      let linkNyaa = null
      html('body > p:nth-child(5) > a').each((_, item) => {
        if (item.attribs?.href && item.attribs.href.startsWith('https://nyaa') && !linkNyaa) {
          linkNyaa = item.attribs.href
        }
      })
      const magnet = html('body > p:nth-child(6) > a')
      if (!magnet.length) return null
      const link = magnet[0].attribs.href
      if (!linkNyaa) return null
      const isAccept = await this.#nyaaService.isAcceptInNyaa(linkNyaa)
      if (!isAccept) return null
      const pubDate = pageDate.replace('Upload date: ', '')
      return { title, link, pubDate, hour: pubDate.split(' ')[1] }
    } catch {
      return null
    }
  }

  /**
   * @param {{title: string, link: string, pubDate: string, hour: string}} param
   * @returns {{title: string, link: string, date: Date}}
   */
  #format({ hour, link, pubDate, title }) {
    const date = pubDate.substring(0, 10)
    const dateFormatted = new Date(`${date} ${hour.substring(0, 5)}:00:000z`)
    return {
      date: dateFormatted,
      link,
      title,
    }
  }

  /**
   *
   * @param {number} total
   * @returns {AsyncGenerator<undefined,{title: string, link: string, date: Date}>}
   */
  async *extractor(total = 2) {
    logger.info('Extractor Moe -> start')
    let url = `/new`

    const { accepted, verify } = await this.repository.listTags()
    this.acceptedTags = accepted.map((item) => item.tag)
    this.#nyaaService.verifyTags = verify.map((item) => item.tag)
    this.#nyaaService.acceptedTags = this.acceptedTags

    const mapa = new Set()
    for (let index = 0; index < total; index++) {
      mapa.clear()
      let newurl = ''
      try {
        const { nextUrl, listData, listVerify } = await this.#process(url)
        if (nextUrl) newurl = nextUrl
        for (const item of listData) {
          yield this.#format(item)
        }
        for (const item of listVerify) {
          const response = await this.#processPageItem(item)
          if (!response) continue
          yield this.#format(response)
        }
      } catch (e) {
        logger.error(e)
        continue
      }
      if (!newurl) {
        break
      }
      url = `${newurl}`
    }

    logger.info('Extractor Moe -> end')
  }

  async #processInPageShow(uri) {
    let page = null
    for (let i = 0; i < 3; i++) {
      try {
        page = await moeApi.get(uri).then((res) => res.data)
        break
      } catch {}
    }
    if (!page) throw new Error('Falha na busca')
    const html = load(page)
    const pageDate = html('body > h3').first().text()
    const blocksAll = html('body > div')
    const blocks = blocksAll.filter((_, block) =>
      block.children.some((child) => child?.attribs?.href && child.attribs?.href.startsWith('magnet:?'))
    )
    const regexHour = /(\d){2}:(\d){2} \|/
    const response = []
    const promises = []
    const processBlock = async (block) => {
      const data = {
        pubDate: pageDate,
      }
      try {
        let uriToPageItem = null
        for (const child of block.children) {
          if (child.attribs?.href?.startsWith('magnet:?')) {
            data.link = child.attribs.href
          } else if (child.attribs?.href?.startsWith('/torrent') && child.children?.length) {
            data.title = child.children[0]?.data
            uriToPageItem = child.attribs.href
          } else if (regexHour.test(child?.data)) {
            data.hour = regexHour.exec(child.data)[0].replace('|', '').trim()
          }
        }
        if (!data.link || !data.title || !data.hour) return null
        if (this.acceptedTags.some((tag) => data.title.includes(tag))) {
          response.push(data)
          return null
        }
        // if (this.#nyaaService.isVerify(data.title)) {
        const result = await this.#processPageItem(uriToPageItem)
        if (!result) return null
        response.push(result)
        // }
      } catch {
        return null
      }
    }
    for (const block of blocks) {
      promises.push(processBlock(block))
      if (promises.length >= 10) {
        await Promise.all(promises)
        promises.length = 0
      }
    }
    await Promise.all(promises)
    const nextUrl = html('body > p:nth-child(8) > a:nth-child(2)').attr('href')
    if (!nextUrl) return response
    return response.concat(await this.#processInPageShow(nextUrl))
  }

  async #listHref() {
    const page = await moeApi.get(`/shows`).then((res) => res.data)
    const html = load(page)
    const blocks = html('body > div:nth-child(4)')
    const listHref = new Set()
    blocks.children().each((_, i) => {
      for (const element of i.children) {
        if (!element.attribs?.id) continue
        if (!element.attribs.id?.startsWith('element')) continue
        for (const child of element.children) {
          if (!child.attribs?.href) continue
          if (!child.attribs.href.startsWith('/show/')) continue
          listHref.add(child.attribs.href)
        }
      }
    })
    return [...listHref].sort((a, b) => {
      const w = parseInt(a.split('/').pop())
      const q = parseInt(b.split('/').pop())
      return w - q
    })
  }

  /**
   * @returns {AsyncGenerator<{}[]>}
   */
  async *extractorAll() {
    logger.info('extractorAll - start')
    const list = await this.#listHref()
    const limit = 20
    const promises = []
    logger.info(`extractorAll - total ${list.length}`)
    for (let index = 0; index < list.length; index++) {
      const item = list[index]
      promises.push(this.#processInPageShow(item))
      if (promises.length < limit) continue
      const responses = await Promise.all(promises)
      logger.info(`${index + 1}/${list.length} -> batch ${limit}`)
      for (const response of responses) {
        if (!response.length) continue
        for (const item of response) {
          yield this.#format(item)
        }
      }
      promises.length = 0
    }
    const responses = await Promise.all(promises)
    for (const response of responses) {
      if (!response.length) continue
      for (const item of response) {
        yield this.#format(item)
      }
    }
    logger.info('extractorAll - end')
  }
}
