import { Readable } from 'node:stream'
export default class CsvServiceMock {
  returns = {
    jsonToCsvStream: new Readable(),
    csvToJson: {},
  }

  jsonToCsvStream() {
    return this.returns.jsonToCsvStream
  }

  csvToJson() {
    return this.returns.csvToJson
  }
}
