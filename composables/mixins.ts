import * as dateFns from 'date-fns'

export function useMixins() {
  const cdnPath = (url: string) => {
    return `${process.env.CDN_URL}${(!(process.env.CDN_URL || '').endsWith('/') && !url.startsWith('/')) ? '/' : ''}${url}`
  }
  const validateLink = (str: string) => {
    const res = str.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g)
    return (res !== null)
  }
  const declOfNum = (number: number, titles: string[]) => {
    const cases = [2, 0, 1, 1, 1, 2]
    if (number < 1) {
      return titles[2]
    }
    number = Math.floor(number)
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]]
  }
  const intToString = (value: number) => {
    const suffixes = ['', 'k', 'm', 'b', 't']
    const suffixNum = Math.floor(('' + value).length / 3)
    let shortValue: number | string = parseFloat((suffixNum !== 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(2))
    if (shortValue % 1 !== 0) {
      shortValue = shortValue.toFixed(1)
    }
    return shortValue + suffixes[suffixNum]
  }
  const secToTime = (sec = 0) => {
    return sec >= 3600 ? new Date(sec * 1000).toISOString().substring(11, 19) : new Date(sec * 1000).toISOString().substring(14, 19)
  }
  const secsToTime = (sec: any = 0) => {
    let seconds: number = parseInt(sec, 10)
    const result = []
    const days = Math.floor(seconds / (3600 * 24))
    if (days) {
      result.push(`${days < 10 ? `0${days}` : days} d.`)
      seconds -= days * 3600 * 24
    }
    const hrs = Math.floor(seconds / 3600)
    if (hrs) {
      result.push(`${hrs < 10 ? `0${hrs}` : hrs} h.`)
      seconds -= hrs * 3600
    }
    const mnts = Math.floor(seconds / 60)
    if (mnts) {
      result.push(`${mnts < 10 ? `0${mnts}` : mnts} min.`)
      seconds -= mnts * 60
    }
    return result.join(' ')
  }
  // const secToTime = (sec = 0) => {
  //   return sec >= 3600 ? new Date(sec * 1000).toISOString().substring(11, 19) : new Date(sec * 1000).toISOString().substring(14, 19)
  // }
  const formatTime = (time: any) => {
    if (!time) {
      return 'unknown time'
    } else {
      const date = typeof time === 'number' ? dateFns.fromUnixTime(time) : new Date(time)
      if (dateFns.isYesterday(date) || dateFns.isToday(date)) {
        return dateFns.formatDistance(date, new Date(), {
          addSuffix: true,
          // locale: ru
        })
      } else {
        return dateFns.format(date, dateFns.isThisYear(date) ? 'HH:mm, d MMM' : 'HH:mm, d MMM yyyy', {
          // locale: ru
        })
      }
    }
  }
  const formatTimeShort = (time: any) => {
    if (!time) {
      return 'unknown time'
    } else {
      // const fromUnix = dateFns.fromUnixTime(time)
      const date = typeof time === 'number' ? dateFns.fromUnixTime(time) : new Date(time)
      if (dateFns.isToday(date)) {
        return dateFns.format(date, 'HH:mm', {
          // locale: ru
        })
      } else {
        return dateFns.format(date, dateFns.isThisYear(date) ? 'HH:mm, d MMM' : 'HH:mm, d MMM yyyy', {
          // locale: ru
        })
      }
    }
  }
  const formatDate = (time: any) => {
    if (!time) {
      return 'unknown date'
    } else {
      // const fromUnix = dateFns.fromUnixTime(time)
      const date = typeof time === 'number' ? dateFns.fromUnixTime(time) : new Date(time)
      return dateFns.format(date, dateFns.isThisYear(date) ? 'd MMM' : 'd MMM yyyy', {
        // locale: ru
      })
    }
  }
  const isLicense = (user: any) => {
    if (!user) {
      return false
    }
    if (user.role !== 'usr') {
      return true
    }
    return user.licenseTill > Math.floor(new Date().getTime() / 1000)
  }
  const filesize = (bytes: number, si = true, dp = 1) => {
    const thresh = si ? 1000 : 1024

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B'
    }

    const units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
    let u = -1
    const r = 10 ** dp

    do {
      bytes /= thresh
      ++u
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

    return bytes.toFixed(dp) + ' ' + units[u]
  }
  const generatePassword = function (size = 8, characters = 'a-z,A-Z,0-9,#') {
    const charactersArray = characters.split(',')
    let CharacterSet = ''
    let password = ''
    if (charactersArray.includes('a-z')) {
      CharacterSet += 'abcdefghijklmnopqrstuvwxyz'
    }
    if (charactersArray.includes('A-Z')) {
      CharacterSet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    }
    if (charactersArray.includes('0-9')) {
      CharacterSet += '0123456789'
    }
    if (charactersArray.includes('#')) {
      CharacterSet += '![]{}()%&*$#^<>~@|'
    }
    for (let i = 0; i < size; i++) {
      password += CharacterSet.charAt(Math.floor(Math.random() * CharacterSet.length))
    }
    return password
  }
  const formatTimeAbsolute = (time: any, ago: boolean = true): string => {
    if (!time) {
      return 'unknown time'
    } else {
      const date = typeof time === 'number' ? dateFns.fromUnixTime(time) : new Date(time)
      return dateFns.format(date, 'HH:mm, d MMM yyyy', {
        // locale: ru
      })
    }
  }
  const copyToClipboard = (text: string): Promise<any> => {
    if (import.meta.client) {
      return navigator.clipboard.writeText(text)
    } else return Promise.reject('error')
  }
  const paymentStatuses: String[] = ['CREATED', 'APPROVED', 'REJECTED']
  const orderStatuses: String[] = ['CREATED', 'PAID', 'ACCEPTED', 'REJECTED', 'DELIVERY', 'DELIVERED', 'RECEIVED']
  const paymentStatusIcons: { [key: string]: any } = {
    CREATED: 'hugeicons:credit-card-change',
    APPROVED: 'hugeicons:credit-card-accept',
    REJECTED: 'hugeicons:credit-card-not-accept'
  }
  const orderStatusIcons: { [key: string]: any } = {
    CREATED: 'hugeicons:shopping-basket-check-out-03',
    PAID: 'hugeicons:credit-card-accept',
    ACCEPTED: 'hugeicons:checkmark-circle-02',
    REJECTED: 'hugeicons:cancel-circle',
    DELIVERY: 'hugeicons:delivery-truck-02',
    DELIVERED: 'hugeicons:delivery-tracking-01',
    RECEIVED: 'hugeicons:safe-delivery-01'
  }

  return {
    cdnPath,
    validateLink,
    declOfNum,
    intToString,
    secToTime,
    secsToTime,
    formatTime,
    formatTimeShort,
    formatDate,
    isLicense,
    generatePassword,
    formatTimeAbsolute,
    copyToClipboard,
    paymentStatuses,
    orderStatuses,
    paymentStatusIcons,
    orderStatusIcons
  }
}
