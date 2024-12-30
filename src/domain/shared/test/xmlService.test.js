import { describe, expect, it } from 'vitest'

import orchestrator from '../../../../tests/orchestrator.js'
import XmlService from '../xmlService.js'

const sut = () => {
  const service = new XmlService()
  return {
    service,
  }
}

describe('xmlService', () => {
  describe('parserToJson', () => {
    it('should return a json object', () => {
      const { service } = sut()
      const json = service.parserToJson('<root><child>Hello</child></root>')
      expect(json).toEqual({
        root: {
          child: 'Hello',
        },
      })
    })
    it('should return an empty object if the xml is empty', () => {
      const { service } = sut()
      const json = service.parserToJson('')
      expect(json).toEqual({})
    })
    it('should return an empty object if the xml is null', () => {
      const { service } = sut()
      const json = service.parserToJson(null)
      expect(json).toEqual({})
    })
    it('should return an empty object if the xml is undefined', () => {
      const { service } = sut()
      const json = service.parserToJson(undefined)
      expect(json).toEqual({})
    })
    it('should return an empty object if the xml is not a string', () => {
      const { service } = sut()
      const json = service.parserToJson(123)
      expect(json).toEqual({})
    })
  })
  describe('buildToRss', () => {
    it('should return a xml string with empty items', () => {
      const { service } = sut()
      const xml = service.buildToRss({ items: [] })
      expect(xml)
        .toEqual(`<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:nyaa="https://nyaa.si/xmlns/nyaa" version="2.0">
  <channel>
    <title>Nyaa - Home - Torrent File RSS</title>
    <description>RSS Feed for Home</description>
    <link>${orchestrator.baseUrl}/</link>
    <atom:link href="${orchestrator.baseUrl}" rel="self" type="application/rss+xml"></atom:link>
    <language>en</language>
  </channel>
</rss>
`)
    })
    it('should return a xml string with items', () => {
      const { service } = sut()
      const xml = service.buildToRss({
        items: [{ title: 'test', id: 1, page: 'teste', pubDate: 'Fri, 05 Apr 2024 18:38:34 -0000', magnet: 'test' }],
      })
      expect(xml)
        .toEqual(`<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:nyaa="https://nyaa.si/xmlns/nyaa" version="2.0">
  <channel>
    <title>Nyaa - Home - Torrent File RSS</title>
    <description>RSS Feed for Home</description>
    <link>${orchestrator.baseUrl}/</link>
    <atom:link href="${orchestrator.baseUrl}" rel="self" type="application/rss+xml"></atom:link>
    <language>en</language>
    <item>
      <title>test</title>
      <link>test</link>
      <guid>teste</guid>
      <pubDate>Fri, 05 Apr 2024 15:38:34 -0000</pubDate>
      <nyaa:seeders>1</nyaa:seeders>
      <nyaa:leechers>18</nyaa:leechers>
      <nyaa:downloads>0</nyaa:downloads>
      <nyaa:infoHash>1</nyaa:infoHash>
      <nyaa:categoryId>1_2</nyaa:categoryId>
      <nyaa:category>Anime - English-translated</nyaa:category>
      <nyaa:size>249.0 MiB</nyaa:size>
      <nyaa:comments>0</nyaa:comments>
      <nyaa:trusted>No</nyaa:trusted>
      <nyaa:remake>No</nyaa:remake>
      <description>&lt;a href=&quot;https://nyaa.si/view/1741283&quot;&gt;#1741283 | 私にだけテンパる上司の話 第01-02巻&lt;/a&gt; | 249.0 MiB | Literature - Raw | 4403A1C9A781FDD47E2F33914D599569CA05DA95</description>
    </item>
  </channel>
</rss>
`)
    })
  })
})
