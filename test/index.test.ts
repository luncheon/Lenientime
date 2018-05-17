import lenientime from '../src/core'
import { tokenAt } from '../src/core/token'
import { padEnd } from '../src/core/utils'

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

describe('parse', () => {
  [
    [''                  , '00:00:00.000'],
    ['1'                 , '01:00:00.000'],
    ['-1'                , '23:00:00.000'],
    ['1am'               , '01:00:00.000'],
    ['1pm'               , '13:00:00.000'],
    ['1p.m.'             , '13:00:00.000'],
    ['13am'              , '01:00:00.000'],
    ['13pm'              , '13:00:00.000'],
    ['12'                , '12:00:00.000'],
    ['12am'              , '00:00:00.000'],
    ['12pm'              , '12:00:00.000'],
    ['24'                , '00:00:00.000'],
    ['123'               , '01:23:00.000'],
    ['123pm'             , '13:23:00.000'],
    ['1234'              , '12:34:00.000'],
    ['12345'             , '01:23:45.000'],
    ['123456'            , '12:34:56.000'],
    ['123456am'          , '00:34:56.000'],
    ['1234567'           , '12:34:56.700'],
    ['12345678'          , '12:34:56.780'],
    ['123456789'         , '12:34:56.789'],
    ['12345678901234'    , '12:34:56.789'],
    ['1.25'              , '01:15:00.000'],
    ['25.5'              , '01:30:00.000'],
    ['123.5'             , '03:30:00.000'],
    [':'                 , '00:00:00.000'],
    ['::'                , '00:00:00.000'],
    [':::'               , '--:--:--.---'],
    ['1:'                , '01:00:00.000'],
    ['12:'               , '12:00:00.000'],
    ['123:'              , '03:00:00.000'],
    ['-1:'               , '23:00:00.000'],
    ['123.5:'            , '03:30:00.000'],
    [':1'                , '00:01:00.000'],
    [':12'               , '00:12:00.000'],
    [':123'              , '02:03:00.000'],
    [':-1'               , '23:59:00.000'],
    [':.25'              , '00:00:15.000'],
    [':1:'               , '00:01:00.000'],
    ['::1'               , '00:00:01.000'],
    ['::12'              , '00:00:12.000'],
    ['::123'             , '00:02:03.000'],
    ['::-1'              , '23:59:59.000'],
    ['::-.124'           , '23:59:59.876'],
    ['1:2'               , '01:02:00.000'],
    [':1:2'              , '00:01:02.000'],
    ['1::2'              , '01:00:02.000'],
    ['1:2:3'             , '01:02:03.000'],
    ['２：３４　ｐＭ'    , '14:34:00.000'],
    ['not a time string' , '--:--:--.---'],
  ].forEach(([input, formatted]) => {
    test(`${padEnd(input, 20)} => ${formatted}`, () => {
      expect(lenientime(input) instanceof lenientime).toBe(true)
      expect(lenientime(input).format('HH:mm:ss.SSS')).toBe(formatted)
      expect(lenientime(input).HHmmssSSS).toBe(formatted)
      expect(lenientime(input).isBefore(formatted)).toBe(false)
      expect(lenientime(input).isAfter(formatted)).toBe(false)
      if (formatted === '--:--:--.---') {
        expect(lenientime(input).equals(formatted)).toBe(false)
        expect(lenientime(input).isBeforeOrEqual(formatted)).toBe(false)
        expect(lenientime(input).isAfterOrEqual(formatted)).toBe(false)
      } else {
        expect(lenientime(input).equals(formatted)).toBe(true)
        expect(lenientime(input).isBeforeOrEqual(formatted)).toBe(true)
        expect(lenientime(input).isAfterOrEqual(formatted)).toBe(true)
      }
    })
  })
})

test('now', async done => {
  await sleep(1000 - Date.now() % 1000)

  const dateNow = new Date()
  const lenientimeNow = lenientime.now()
  const lenientimeParseNow = lenientime('now')

  expect(lenientimeNow.seconds).toBe(dateNow.getSeconds())
  expect(lenientimeNow.minutes).toBe(dateNow.getMinutes())
  expect(lenientimeNow.hours)  .toBe(dateNow.getHours())
  expect(lenientimeParseNow.seconds).toBe(dateNow.getSeconds())
  expect(lenientimeParseNow.minutes).toBe(dateNow.getMinutes())
  expect(lenientimeParseNow.hours)  .toBe(dateNow.getHours())
  done()
})

describe('tokenAt', () => {
  test('h:m:s a / 12:34:56 pm', () => {
    expect(tokenAt('h:m:s a', '12:34:56 pm',  0)).toMatchObject({ property: 'h', index: 0, value: '12' })
    expect(tokenAt('h:m:s a', '12:34:56 pm',  1)).toMatchObject({ property: 'h', index: 0, value: '12' })
    expect(tokenAt('h:m:s a', '12:34:56 pm',  2)).toMatchObject({ property: 'h', index: 0, value: '12' })
    expect(tokenAt('h:m:s a', '12:34:56 pm',  3)).toMatchObject({ property: 'm', index: 3, value: '34' })
    expect(tokenAt('h:m:s a', '12:34:56 pm',  4)).toMatchObject({ property: 'm', index: 3, value: '34' })
    expect(tokenAt('h:m:s a', '12:34:56 pm',  5)).toMatchObject({ property: 'm', index: 3, value: '34' })
    expect(tokenAt('h:m:s a', '12:34:56 pm',  6)).toMatchObject({ property: 's', index: 6, value: '56' })
    expect(tokenAt('h:m:s a', '12:34:56 pm',  7)).toMatchObject({ property: 's', index: 6, value: '56' })
    expect(tokenAt('h:m:s a', '12:34:56 pm',  8)).toMatchObject({ property: 's', index: 6, value: '56' })
    expect(tokenAt('h:m:s a', '12:34:56 pm',  9)).toMatchObject({ property: 'a', index: 9, value: 'pm' })
    expect(tokenAt('h:m:s a', '12:34:56 pm', 10)).toMatchObject({ property: 'a', index: 9, value: 'pm' })
    expect(tokenAt('h:m:s a', '12:34:56 pm', 11)).toMatchObject({ property: 'a', index: 9, value: 'pm' })
  })

  test('H:m:s a / 1:2:3 pm', () => {
    expect(tokenAt('H:m:s a', '1:2:3 pm', 0)).toMatchObject({ property: 'H', index: 0, value: '1' })
    expect(tokenAt('H:m:s a', '1:2:3 pm', 1)).toMatchObject({ property: 'H', index: 0, value: '1' })
    expect(tokenAt('H:m:s a', '1:2:3 pm', 2)).toMatchObject({ property: 'm', index: 2, value: '2' })
    expect(tokenAt('H:m:s a', '1:2:3 pm', 3)).toMatchObject({ property: 'm', index: 2, value: '2' })
    expect(tokenAt('H:m:s a', '1:2:3 pm', 4)).toMatchObject({ property: 's', index: 4, value: '3' })
    expect(tokenAt('H:m:s a', '1:2:3 pm', 5)).toMatchObject({ property: 's', index: 4, value: '3' })
    expect(tokenAt('H:m:s a', '1:2:3 pm', 6)).toMatchObject({ property: 'a', index: 6, value: 'pm' })
    expect(tokenAt('H:m:s a', '1:2:3 pm', 7)).toMatchObject({ property: 'a', index: 6, value: 'pm' })
    expect(tokenAt('H:m:s a', '1:2:3 pm', 8)).toMatchObject({ property: 'a', index: 6, value: 'pm' })
  })

  test('A HH:m:s / PM 12:3:4', () => {
    expect(tokenAt('A HH:mm:ss', 'PM 01:02:03',  0)).toMatchObject({ property: 'A',  index: 0, value: 'PM' })
    expect(tokenAt('A HH:mm:ss', 'PM 01:02:03',  1)).toMatchObject({ property: 'A',  index: 0, value: 'PM' })
    expect(tokenAt('A HH:mm:ss', 'PM 01:02:03',  2)).toMatchObject({ property: 'A',  index: 0, value: 'PM' })
    expect(tokenAt('A HH:mm:ss', 'PM 01:02:03',  3)).toMatchObject({ property: 'HH', index: 3, value: '01' })
    expect(tokenAt('A HH:mm:ss', 'PM 01:02:03',  4)).toMatchObject({ property: 'HH', index: 3, value: '01' })
    expect(tokenAt('A HH:mm:ss', 'PM 01:02:03',  5)).toMatchObject({ property: 'HH', index: 3, value: '01' })
    expect(tokenAt('A HH:mm:ss', 'PM 01:02:03',  6)).toMatchObject({ property: 'mm', index: 6, value: '02' })
    expect(tokenAt('A HH:mm:ss', 'PM 01:02:03',  7)).toMatchObject({ property: 'mm', index: 6, value: '02' })
    expect(tokenAt('A HH:mm:ss', 'PM 01:02:03',  8)).toMatchObject({ property: 'mm', index: 6, value: '02' })
    expect(tokenAt('A HH:mm:ss', 'PM 01:02:03',  9)).toMatchObject({ property: 'ss', index: 9, value: '03' })
    expect(tokenAt('A HH:mm:ss', 'PM 01:02:03', 10)).toMatchObject({ property: 'ss', index: 9, value: '03' })
    expect(tokenAt('A HH:mm:ss', 'PM 01:02:03', 11)).toMatchObject({ property: 'ss', index: 9, value: '03' })
  })
})
