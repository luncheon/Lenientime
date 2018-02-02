export default interface LenientimeLike {
  readonly h:             string | number
  readonly hour:          string | number
  readonly hours:         string | number
  readonly m:             string | number
  readonly minute:        string | number
  readonly minutes:       string | number
  readonly s:             string | number
  readonly second:        string | number
  readonly seconds:       string | number
  readonly S:             string | number
  readonly millisecond:   string | number
  readonly milliseconds:  string | number
  readonly a:             'am' | 'pm' | 'AM' | 'PM' | '--'
  readonly am:            boolean
  readonly pm:            boolean
}
