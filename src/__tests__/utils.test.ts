import { parseDate } from '../utils'

describe('Utils', () => {
    test('parse date', () => {
        expect(parseDate('180801')).toEqual(new Date(2018, 7, 1))
    })
    test('parse date with time', () => {
        expect(parseDate('1808010117')).toEqual(new Date(2018, 7, 1, 1, 17))
    })
})
