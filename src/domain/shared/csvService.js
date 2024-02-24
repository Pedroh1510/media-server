import { Transform } from '@json2csv/node'
export default class CsvService {
  jsonToCsvStream({ delimiter = '|', objectMode = false, decodeStrings = false, ndjson = false }) {
    return new Transform(
      {
        delimiter,
        ndjson,
        header: true,
        eol: '\n',
        formatters: {
          string: (a) => a,
        },
      },
      { objectMode },
      { objectMode, decodeStrings }
    )
  }
}
