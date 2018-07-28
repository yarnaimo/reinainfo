import { Schedule, Part } from '../models/schedule'
import { validate } from 'class-validator'

describe('Schedule', () => {
    test('pass validation', async () => {
        const s = new Schedule()
        s.category = 'live'
        s.title = 'Release event'
        s.date = new Date()
        s.parts = [new Part('1st', [, , new Date()])]
        s.url = 'https://google.com'

        const errors = await validate(s)
        expect(errors.length).toBe(0)
    })
    
    test('fail validation', async () => {
        const s = new Schedule()
        s.category = 'live'
        s.title = 'short'
        s.date = new Date()
        s.parts = [new Part('1st', [, , new Date()])]
        s.url = 'invalid url'

        const errors = await validate(s)
        expect(errors.length).toBe(2)
    })
})
