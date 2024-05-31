import lodash from 'lodash'

export default class Utils {
  static isEmpty(data) {
    return lodash.isEmpty(data)
  }
}
