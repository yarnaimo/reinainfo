import { css } from 'emotion'
import { Component } from 'vue-property-decorator'
import { VueT } from '../../utils/vue-tsx'
import { RoundedLink } from '../atoms/RoundedLink'

interface Props {}

@Component
export class Routes extends VueT<Props> implements Props {
    links = [
        { to: '/topic', icon: 'newspaper' },
        { to: '/schedule', icon: 'calendar' },
        { to: '/links', icon: 'link-variant' },
        { to: '/about', icon: 'information-outline' },
    ]

    render() {
        return (
            <div
                class={css({
                    display: 'flex',
                    alignItems: 'center',
                })}
            >
                {this.links.map(({ to, icon }) => (
                    <RoundedLink to={to} icon={icon} borderlessOnPortrait />
                ))}
            </div>
        )
    }
}
