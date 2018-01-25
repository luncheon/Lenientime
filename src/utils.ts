export function padStart(source: any, maxLength: number, pad?: string) {
  source = String(source)
  if (!maxLength || !isFinite(maxLength) || source.length >= maxLength) {
    return source
  }
  return _pad(maxLength - source.length, pad) + source
}

export function padEnd(source: any, maxLength: number, pad?: string) {
  source = String(source)
  if (!maxLength || !isFinite(maxLength) || source.length >= maxLength) {
    return source
  }
  return source + _pad(maxLength - source.length, pad)
}

function _pad(padLength: number, pad?: string) {
  pad = pad === undefined || pad === null || pad === '' ? ' ' : String(pad)
  let paddings = pad
  while (paddings.length < padLength) {
    paddings += pad
  }
  return paddings.substr(0, padLength)
}

export function firstNumberOf(...args: (any | undefined)[]): number | undefined
export function firstNumberOf() {
  for (let i = 0, len = arguments.length; i < len; ++i) {
    const value = arguments[i]
    if (typeof value === 'number') {
      return value
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      if (isFinite(parsed)) {
        return parsed
      }
    }
  }
  return undefined
}

export const    SECOND_IN_MILLISECONDS = 1000
export const    MINUTE_IN_MILLISECONDS = SECOND_IN_MILLISECONDS * 60
export const      HOUR_IN_MILLISECONDS = MINUTE_IN_MILLISECONDS * 60
export const  HALF_DAY_IN_MILLISECONDS =   HOUR_IN_MILLISECONDS * 12
export const       DAY_IN_MILLISECONDS =   HOUR_IN_MILLISECONDS * 24

export function normalizeMillisecondsInOneDay(milliseconds: number) {
  const value = Math.floor(milliseconds) % DAY_IN_MILLISECONDS
  return value >= 0 ? value : value + DAY_IN_MILLISECONDS
}

export function am(milliseconds: number) {
  return milliseconds >= HALF_DAY_IN_MILLISECONDS ? milliseconds - HALF_DAY_IN_MILLISECONDS : milliseconds
}

export function pm(milliseconds: number) {
  return milliseconds < HALF_DAY_IN_MILLISECONDS ? milliseconds + HALF_DAY_IN_MILLISECONDS : milliseconds
}

export function ampm(milliseconds: number, a: string) {
  milliseconds = normalizeMillisecondsInOneDay(milliseconds)
  switch (String(a).toLowerCase()) {
    case 'am':  return am(milliseconds)
    case 'pm':  return pm(milliseconds)
    default:    return milliseconds
  }
}
