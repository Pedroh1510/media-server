import request from 'supertest'
import { Readable } from 'node:stream'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AdmController } from '../src/domain/adm/adm.controller'
import { AdmService } from '../src/domain/adm/adm.service'

const mockAdmService = {
  deleteFiles: jest.fn().mockResolvedValue({ total: 0, totalDeleted: 0 }),
  deleteRss: jest.fn().mockResolvedValue(undefined),
  exportData: jest.fn().mockReturnValue({
    fileName: 'data.csv',
    stream: Readable.from([]),
  }),
  importData: jest.fn().mockResolvedValue({ totalInserted: 0 }),
  listTags: jest.fn().mockResolvedValue({ acceptedTags: [], verifyTags: [] }),
  insertTags: jest.fn().mockResolvedValue(undefined),
  clearScanCache: jest.fn().mockResolvedValue(undefined),
}

describe('AdmController (integration)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AdmController],
      providers: [{ provide: AdmService, useValue: mockAdmService }],
    }).compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterAll(() => app.close())

  beforeEach(() => jest.clearAllMocks())

  describe('GET /adm/delete', () => {
    it('retorna 200 com totais', async () => {
      await request(app.getHttpServer())
        .get('/adm/delete')
        .expect(200)
        .expect({ total: 0, totalDeleted: 0 })
    })
  })

  describe('GET /adm/delete-rss', () => {
    it('retorna 200 com body vazio', async () => {
      const res = await request(app.getHttpServer())
        .get('/adm/delete-rss')
        .expect(200)
      expect(res.body).toEqual({})
      expect(mockAdmService.deleteRss).toHaveBeenCalled()
    })
  })

  describe('GET /adm/export-data', () => {
    it('retorna 200 com header Content-Disposition attachment', async () => {
      const res = await request(app.getHttpServer())
        .get('/adm/export-data')
        .expect(200)
      expect(res.headers['content-disposition']).toMatch(/attachment/)
    })
  })

  describe('POST /adm/import-data', () => {
    it('retorna 200 com { totalInserted: 0 }', async () => {
      await request(app.getHttpServer())
        .post('/adm/import-data')
        .send('')
        .expect(201)
        .expect({ totalInserted: 0 })
    })
  })

  describe('GET /adm/tags', () => {
    it('retorna 200 com listas de tags', async () => {
      await request(app.getHttpServer())
        .get('/adm/tags')
        .expect(200)
        .expect({ acceptedTags: [], verifyTags: [] })
    })
  })

  describe('POST /adm/tags', () => {
    it('retorna 201 com body vazio', async () => {
      await request(app.getHttpServer())
        .post('/adm/tags')
        .send({ acceptedTags: ['shounen'], verifyTags: [] })
        .expect(201)
      expect(mockAdmService.insertTags).toHaveBeenCalledWith({
        acceptedTags: ['shounen'],
        verifyTags: [],
      })
    })
  })

  describe('POST /adm/cache-clean', () => {
    it('retorna 202 com body vazio', async () => {
      await request(app.getHttpServer())
        .post('/adm/cache-clean')
        .expect(202)
      expect(mockAdmService.clearScanCache).toHaveBeenCalled()
    })
  })
})
