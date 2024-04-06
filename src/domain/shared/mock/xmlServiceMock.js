export default class XmlServiceMock {
  returns = {
    parserToJson: {},
    buildToRss: '',
  }

  parserToJson() {
    return this.returns.parserToJson
  }

  buildToRss() {
    return this.returns.buildToRss
  }
}
