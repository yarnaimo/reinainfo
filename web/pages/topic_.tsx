import { css } from 'emotion'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { MSchedule, Schedule } from '~/models/Schedule'
import { MTweetLog, TweetLog } from '~/models/TweetLog'
import { day, toDateString } from '~/utils/day'
import CSchedule from '../components/molecules/CSchedule'
import { CTweet } from '../components/molecules/CTweet'
import { EmptyState } from '../components/organisms/EmptyState'
import { head } from '../utils/vue-tsx'
import { fontSize, juliusFont, palette } from '../variables/css'
import {
    container,
    csmdi,
    flex,
    mdih,
    pageContent,
    pageTitle,
} from '../variables/directives'

@Component(head('Topic'))
export default class extends Vue {
    mounted() {
        this.weekOffset = 0
    }

    weekOffset: number = 1

    prevWeek() {
        this.weekOffset -= 1
    }

    nextWeek() {
        this.weekOffset += 1
    }

    get startOfCurrentWeek() {
        return day()
            .add(1, 'day')
            .add(2, 'hour')
            .startOf('week')
            .subtract(1, 'day')
            .subtract(2, 'hour')
    }

    get since() {
        return this.startOfCurrentWeek.add(this.weekOffset, 'week')
    }

    get until() {
        return this.since.add(1, 'week')
    }

    get durationString() {
        return `${toDateString(this.since.add(1, 'day'))} ～ ${toDateString(
            this.until
        )}`
    }

    tweetLogs: MTweetLog[] = []

    schedules: MSchedule[] = []

    get topicExists() {
        return this.schedules.length || this.tweetLogs.length
    }

    @Watch('weekOffset')
    async fetchTopics() {
        try {
            const [tweetLogs, schedules] = await Promise.all([
                TweetLog.query
                    .where('isTopic', '==', true)
                    .where('createdAt', '>=', this.since.toDate())
                    .where('createdAt', '<', this.until.toDate())
                    .orderBy('createdAt', 'desc')
                    .once(),
                Schedule.query
                    .where('createdAt', '>=', this.since.toDate())
                    .where('createdAt', '<', this.until.toDate())
                    .orderBy('createdAt', 'desc')
                    .once(),
            ])
            this.tweetLogs = tweetLogs
            this.schedules = schedules
        } catch (error) {
            console.error('Failed to fetch topics: ', error)
        }
    }

    render() {
        return (
            <main>
                <div class={pageTitle}>
                    <span class={[flex({}, 'start', 'baseline')]}>
                        <h1 class={juliusFont}>
                            <i class={mdih.one('newspaper')} />
                            Topic
                        </h1>
                        <span
                            class={css({
                                marginLeft: 8,
                                color: palette.grey,
                            })}
                        >
                            {this.durationString}
                        </span>
                    </span>

                    <span class={css({ flexGrow: 1 })} />

                    <button
                        onClick={this.prevWeek}
                        class={[chevron, csmdi('chevron-left')]}
                    />

                    <span class={css({ flexBasis: 10 })} />

                    <button
                        disabled={this.weekOffset === 0}
                        onClick={this.nextWeek}
                        class={[chevron, csmdi('chevron-right')]}
                    />
                </div>

                {this.topicExists ? (
                    <div class={pageContent}>
                        {this.schedules.length > 0 && (
                            <section class={[container]}>
                                <h2 class={juliusFont}>
                                    <i class={mdih.two('calendar-plus')} />
                                    New Schedules
                                </h2>
                                <ul>
                                    {this.schedules.map(s => (
                                        <CSchedule schedule={s} key={s.id} />
                                    ))}
                                </ul>
                            </section>
                        )}
                        {this.tweetLogs.length > 0 && (
                            <section
                                class={[
                                    container,
                                    // this.tweetLogs.length || noDisplay,
                                ]}
                            >
                                <h2 class={juliusFont}>
                                    <i class={mdih.two('twitter')} />
                                    Tweets
                                </h2>
                                <ul>
                                    {this.tweetLogs.map(t => (
                                        <CTweet
                                            id={t.tweetId}
                                            key={t.tweetId}
                                        />
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                ) : (
                    <EmptyState
                        icon="thought-bubble-outline"
                        text="この期間のトピックはありません"
                    />
                )}
            </main>
        )
    }
}

const chevron = css(fontSize.h1, {
    ':active': {
        color: palette.brown,
    },
})
