import { Parts, Schedule } from '~/models/Schedule'
import { parseDate } from '~/utils/day'

export const scheduleFixture = ({
    isAppearance = true,
    hasParts = true,
} = {}) => {
    if (isAppearance) {
        if (hasParts) {
            return new Schedule().setData({
                category: 'event',
                title:
                    '「Caligula-カリギュラ-」スペシャルイベント第65536弾 Girl’s Party',
                date: parseDate('180117.1230'),
                parts: Parts.parse('昼の部.1230+.1500.1530+夜の部.1730..1830'),
                url: 'https://t.co',
                venue: 'サイエンスホール',
                way: '抽選',
            })
        } else {
            return new Schedule().setData({
                category: 'up',
                title: 'FFFFFF',
                date: parseDate('180117.1800'),
                url: 'https://t.co',
            })
        }
    }
    return new Schedule().setData({
        category: 'book',
        title: 'Voice Actress',
        date: parseDate('180117'),
        url: 'https://t.co',
    })
}
