import { Readable, Transform } from 'node:stream'
import { describe, expect, test } from 'vitest'

import CsvService from '../csvService.js'

const sut = () => {
  const service = new CsvService()
  return { service }
}
function streamToString(stream) {
  const chunks = []
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on('error', (err) => reject(err))
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

describe('CsvService', () => {
  describe('csvToJson', () => {
    test('it should be able to return json', async () => {
      const { service } = sut()
      const readStream = new Readable()
      readStream.push('a|b\n')
      readStream.push('1|2\n')
      readStream.push('3|4\n')
      readStream.push(null)
      await expect(
        streamToString(
          readStream.pipe(service.csvToJson()).pipe(
            new Transform({
              objectMode: true,
              transform(chunk, _, cb) {
                this.push(JSON.stringify(chunk))
                cb(null)
              },
            })
          )
        )
      ).resolves.toEqual('{"a":"1","b":"2"}{"a":"3","b":"4"}')
    })

    test('it should be able to handle empty csv stream', async () => {
      const { service } = sut()
      const readStream = new Readable()
      readStream.push(null)
      await expect(
        streamToString(
          readStream.pipe(service.csvToJson()).pipe(
            new Transform({
              objectMode: true,
              transform(chunk, _, cb) {
                this.push(JSON.stringify(chunk))
                cb(null)
              },
            })
          )
        )
      ).resolves.toEqual('')
    })

    test('it should be able to handle csv stream with only headers', async () => {
      const { service } = sut()
      const readStream = new Readable()
      readStream.push('a|b\n')
      readStream.push(null)
      await expect(
        streamToString(
          readStream.pipe(service.csvToJson()).pipe(
            new Transform({
              objectMode: true,
              transform(chunk, _, cb) {
                this.push(JSON.stringify(chunk))
                cb(null)
              },
            })
          )
        )
      ).resolves.toEqual('')
    })

    test('it should be able to handle csv stream with missing headers', async () => {
      const { service } = sut()
      const readStream = new Readable()
      readStream.push('1|2\n')
      readStream.push('3|4\n')
      readStream.push(null)
      await expect(
        streamToString(
          readStream.pipe(service.csvToJson()).pipe(
            new Transform({
              objectMode: true,
              transform(chunk, _, cb) {
                this.push(JSON.stringify(chunk))
                cb(null)
              },
            })
          )
        )
      ).resolves.toEqual('{"1":"3","2":"4"}')
    })
  })
  describe('jsonToCsvStream', () => {
    test('it should be able to ', async () => {
      const { service } = sut()

      const readStream = new Readable({ objectMode: true })

      readStream.push({ a: 1, b: 2 })
      readStream.push({ a: 3, b: 4 })
      readStream.push(null)
      await expect(streamToString(readStream.pipe(service.jsonToCsvStream({ objectMode: true })))).resolves.toEqual(
        `a|b\n1|2\n3|4`
      )
    })

    // The jsonToCsvStream function should be able to handle a stream with missing properties and replace them with empty values in the CSV.

    test('it should replace missing properties with empty values in the CSV', async () => {
      const { service } = sut()

      const readStream = new Readable({ objectMode: true })
      readStream.push({ a: 1 })
      readStream.push({ b: 2 })
      readStream.push(null)

      await expect(streamToString(readStream.pipe(service.jsonToCsvStream({ objectMode: true })))).resolves.toEqual(
        `a\n1`
      )
    })
  })
})
