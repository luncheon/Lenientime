import { limit, padStart } from './utils'

function tokenPattern() {
  return /\\.|HH?|hh?|kk?|mm?|ss?|S{1,3}|AA?|aa?|_H|_h|_k|_m|_s/g
}

export interface LenientimeFormattable {
  readonly H:   string
  readonly HH:  string
  readonly _H:  string
  readonly h:   string
  readonly hh:  string
  readonly _h:  string
  readonly k:   string
  readonly kk:  string
  readonly _k:  string
  readonly m:   string
  readonly mm:  string
  readonly _m:  string
  readonly s:   string
  readonly ss:  string
  readonly _s:  string
  readonly S:   string
  readonly SS:  string
  readonly SSS: string
  readonly a:   string
  readonly A:   string
  readonly aa:  string
  readonly AA:  string
}

const adjusters: Record<keyof LenientimeFormattable, (value: string) => (amount: number, cyclic?: boolean) => string | undefined> = {
  H:    tokenAdjuster(0, 23),
  HH:   tokenAdjuster(0, 23, 2, '0'),
  _H:   tokenAdjuster(0, 23, 2),
  h:    tokenAdjuster(1, 12),
  hh:   tokenAdjuster(1, 12, 2, '0'),
  _h:   tokenAdjuster(1, 12, 2),
  k:    tokenAdjuster(0, 11),
  kk:   tokenAdjuster(0, 11, 2, '0'),
  _k:   tokenAdjuster(0, 23, 2),
  m:    tokenAdjuster(0, 59),
  mm:   tokenAdjuster(0, 59, 2, '0'),
  _m:   tokenAdjuster(0, 59, 2),
  s:    tokenAdjuster(0, 59),
  ss:   tokenAdjuster(0, 59, 2, '0'),
  _s:   tokenAdjuster(0, 59, 2),
  S:    tokenAdjuster(0, 9),
  SS:   tokenAdjuster(0, 99, 2, '0'),
  SSS:  tokenAdjuster(0, 999, 3, '0'),
  a:    value => amount => value === 'pm' ? 'am' : 'pm',
  A:    value => amount => value === 'PM' ? 'AM' : 'PM',
  aa:   value => amount => value === 'p.m.' ? 'a.m.' : 'p.m.',
  AA:   value => amount => value === 'P.M.' ? 'A.M.' : 'P.M.',
}

function tokenAdjuster(min: number, max: number, length: number = 1, pad?: string) {
  return (value: string) => (amount: number, cyclic?: boolean) => {
    const adjusted = limit(parseInt(value, 10) + amount, min, max, cyclic)
    return isNaN(adjusted) ? undefined : padStart(adjusted, length, pad)
  }
}

export function format(template: string, time: LenientimeFormattable) {
  return String(template).replace(tokenPattern(), token => token[0] === '\\' ? token[1] : time[token as keyof LenientimeFormattable])
}

export function tokenAt(template: string, value: string, position: number): undefined | {
  /** @example 'hh' */
  property: string
  /** @example '12' */
  value: string
  index: number
  adjust: (amount: number, cyclic?: boolean) => string | undefined
} {
  const tokens = tokenizeTemplate(template)
  let offset = 0
  let previuosLastIndex = 0
  for (let i = 0; i < tokens.length; ++i) {
    const token = tokens[i]
    if (token.literal) {
      const index = value.indexOf(token.property, offset)
      if (index === -1 || index >= position) {
        if (i === 0) {
          return
        }
        const _value = value.slice(previuosLastIndex, index)
        const property = tokens[i - 1].property as keyof LenientimeFormattable
        return { property, index: previuosLastIndex, value: _value, adjust: adjusters[property](_value) }
      } else {
        previuosLastIndex = offset = index + token.property.length
      }
    } else if (token.property[0] === '_' && value[offset] === ' ') {
      ++offset
    }
  }
  const lastToken = tokens[tokens.length - 1]
  if (lastToken && !lastToken.literal) {
    const _value = value.slice(offset)
    const property = lastToken.property as keyof LenientimeFormattable
    return { property, index: offset, value: _value, adjust: adjusters[property](_value) }
  }
  return
}

export function tokenizeTemplate(template: string) {
  const pattern = tokenPattern()
  const tokens: {
    index:    number
    property: string
    literal:  boolean
  }[] = []
  let previousLastIndex = 0
  let match: RegExpExecArray | null
  while (match = pattern.exec(template)) {  // tslint:disable-line:no-conditional-assignment
    const index = match.index
    const lastIndex = pattern.lastIndex
    if (previousLastIndex !== index) {
      tokens.push({ index: previousLastIndex, property: template.slice(previousLastIndex, index), literal: true })
    }
    if (match[0][0] === '\\') {
      tokens.push({ index, property: match[0].slice(1), literal: true })
    } else {
      tokens.push({ index, property: match[0], literal: false })
    }
    previousLastIndex = lastIndex
  }
  if (previousLastIndex < template.length) {
    tokens.push({ index: previousLastIndex, property: template.slice(previousLastIndex), literal: true })
  }
  return tokens
}
