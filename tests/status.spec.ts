import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { StatusController } from '../src/domain/status/status.controller'
import { StatusService } from '../src/domain/status/status.service'

describe('StatusController (integration)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [StatusController],
      providers: [
        {
          provide: StatusService,
          useValue: { getStatus: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterAll(() => app.close())

  it('GET /status → 200 com { message: "Status" }', async () => {
    await request(app.getHttpServer())
      .get('/status')
      .expect(200)
      .expect({ message: 'Status' })
  })
})
