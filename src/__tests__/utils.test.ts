import { parseDate, stringify } from '../utils'

describe('Utils', () => {
    test('parse date', () => {
        expect(parseDate('180801')).toEqual(new Date(2018, 7, 1))
    })

    test('parse date with time', () => {
        expect(parseDate('180801.0117')).toEqual(new Date(2018, 7, 1, 1, 17))
    })

    test('stringify', () => {
        expect(
            stringify({ name: 'imo', id: 3 }, { id: (id: number) => id + '' })
        ).toBe(
            JSON.stringify(
                {
                    id: '3',
                    name: 'imo',
                },
                undefined,
                2
            )
        )
    })
})
