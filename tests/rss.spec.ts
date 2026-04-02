import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { RssController } from '../src/domain/rss/rss.controller'
import { RssService } from '../src/domain/rss/rss.service'

const mockRssService = {
  listAsXml: jest.fn().mockResolvedValue('<rss/>'),
  list: jest.fn().mockResolvedValue([]),
  listAll: jest.fn().mockResolvedValue([]),
  count: jest.fn().mockResolvedValue({ total: 0 }),
}

describe('RssController (integration)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [RssController],
      providers: [{ provide: RssService, useValue: mockRssService }],
    }).compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterAll(() => app.close())

  beforeEach(() => jest.clearAllMocks())

  describe('GET /rss', () => {
    it('retorna 200 com Content-Type application/xml', async () => {
      await request(app.getHttpServer())
        .get('/rss')
        .expect(200)
        .expect('Content-Type', /xml/)
        .expect('<rss/>')
    })

    it('repassa query params para listAsXml', async () => {
      await request(app.getHttpServer())
        .get('/rss?isScan=false&term=naruto')
        .expect(200)
      expect(mockRssService.listAsXml).toHaveBeenCalledWith(
        expect.objectContaining({ isScan: 'false', term: 'naruto' }),
      )
    })
  })

  describe('GET /rss/json', () => {
    it('retorna 200 com array vazio', async () => {
      await request(app.getHttpServer()).get('/rss/json').expect(200).expect([])
    })

    it('repassa query params para list', async () => {
      await request(app.getHttpServer()).get('/rss/json?term=one+piece').expect(200)
      expect(mockRssService.list).toHaveBeenCalledWith(
        expect.objectContaining({ term: 'one piece' }),
      )
    })
  })

  describe('GET /rss/all', () => {
    it('retorna 200 com array vazio', async () => {
      await request(app.getHttpServer()).get('/rss/all').expect(200).expect([])
    })
  })

  describe('GET /rss/amount', () => {
    it('retorna 200 com { total: 0 }', async () => {
      await request(app.getHttpServer())
        .get('/rss/amount')
        .expect(200)
        .expect({ total: 0 })
    })
  })
})
