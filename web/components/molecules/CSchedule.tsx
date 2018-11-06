import { css } from 'emotion'
import { Component, Prop } from 'vue-property-decorator'
import { Schedule } from '../../../src/models/Schedule'
import { VueT } from '../../utils/vue-tsx'
import { palette } from '../../variables/css'
import { flex, mdi } from '../../variables/directives'
import { Link } from '../atoms/Link'
import ExpandableCard from './ExpandableCard'

interface Props {
    schedule: Schedule
}

@Component
export default class CSchedule extends VueT<Props> implements Props {
    @Prop()
    schedule!: Schedule

    get s() {
        return this.schedule
    }

    get date() {
        return this.s.fDate.date
    }

    get parts() {
        return this.s.fDate.parts && this.s.fDate.parts.array
    }

    get cardColor() {
        if (this.s.category === 'up') return palette.brown
        if (this.s.isAppearance) return palette.pink
        return palette.cyan
    }

    get headerProps() {
        return {
            color: this.cardColor,
            icon: this.s.categoryObj.icon,
            title: this.s.title,
        }
    }

    expanded: boolean = false

    toggle() {
        this.expanded = !this.expanded
    }

    render() {
        return (
            <ExpandableCard header={this.headerProps}>
                <template slot="headerTop">
                    <time datetime={this.s.date.toISOString()}>
                        {this.date}
                    </time>

                    <span class={css({ fontSize: '0.8em' })}>
                        {this.s.categoryObj.name}
                    </span>
                </template>

                <template slot="content">
                    <p class={withIcon}>
                        <i class={mdi('link-variant', -1, 10)} />
                        <Link external to={this.s.url} icon="open-in-new">
                            公式サイト
                        </Link>
                    </p>

                    {this.parts && (
                        <p>
                            {this.parts.map(p => (
                                <dl class={withIcon}>
                                    <i
                                        class={mdi(
                                            'chevron-right-circle-outline',
                                            -1,
                                            10
                                        )}
                                    />
                                    <dt
                                        class={css({
                                            minWidth: 56,
                                            marginRight: 8,
                                        })}
                                    >
                                        {p.name}
                                    </dt>
                                    <dl>{p.time}</dl>
                                </dl>
                            ))}
                        </p>
                    )}

                    {this.s.venue && (
                        <p class={withIcon}>
                            <i class={mdi('map-marker', -1, 10)} />
                            <Link
                                external
                                to={`https://maps.google.co.jp/maps?q=${encodeURIComponent(
                                    this.s.venue
                                )}`}
                                icon="map-search-outline"
                            >
                                {this.s.venue}
                            </Link>
                        </p>
                    )}

                    {this.s.way && (
                        <p class={withIcon}>
                            <i class={mdi('gesture-double-tap', -1, 10)} />
                            <div>{this.s.way}</div>
                        </p>
                    )}
                </template>
            </ExpandableCard>
        )
    }
}

const withIcon = flex({}, 'start', 'baseline')
