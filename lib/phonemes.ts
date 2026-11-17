// Full phoneme set the library is built around. The landing page always
// shows all of them; phonemes without published activities render as
// "Em breve" until content is approved.
// Values must match Activity.phoneme in the DB (uppercase).
export const PHONEMES = [
  'B',
  'CH',
  'D',
  'F',
  'G',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'R',
  'S',
  'T',
  'V',
  'Z',
] as const;

// Below this many published activities the landing headline talks about the
// catalog in general instead of quoting a small number.
export const MIN_ACTIVITIES_TO_SHOW_COUNT = 50;
