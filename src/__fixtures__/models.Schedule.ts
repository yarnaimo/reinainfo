import { ScheduleAdmin } from '~/models/admin'
import { Parts } from '~/models/Parts'
import { parseDate } from '~/utils/day'

export const scheduleFixture = (categoryType?: 'up' | 'release') => {
    const schedule = ScheduleAdmin.create()

    switch (categoryType) {
        case 'release':
            schedule.set({
                category: 'book',
                title: 'Voice Actress',
                date: parseDate('180117'),
                url: 'https://t.co',
            })
            break

        case 'up':
            schedule.set({
                category: 'up',
                title: 'FFFFFF',
                date: parseDate('180117.1800'),
                url: 'https://t.co',
            })
            break

        default:
            schedule.set({
                category: 'event',
                title: '「Caligula-カリギュラ-」スペシャルイベント第65536弾 Girl’s Party',
                date: parseDate('180117.1230'),
                parts: Parts.parse('昼の部.1230+.1500.1530+夜の部.1730..1830'),
                url: 'https://t.co',
                venue: 'サイエンスホール',
                way: '抽選',
            })
            break
    }

    return schedule
}
