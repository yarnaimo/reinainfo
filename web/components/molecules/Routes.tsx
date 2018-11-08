import { css } from 'emotion'
import { Component } from 'vue-property-decorator'
import { VueT } from '../../utils/vue-tsx'
import { shape } from '../../variables/css'
import { block } from '../../variables/directives'
import { RoundedLink } from '../atoms/RoundedLink'

interface Props {}

@Component
export class Routes extends VueT<Props> implements Props {
    links = [
        { label: 'Topic', to: '/topic', icon: 'newspaper' },
        { label: 'Schedule', to: '/schedule', icon: 'calendar' },
        { label: 'Links', to: '/links', icon: 'link-variant' },
        { label: 'About', to: '/about', icon: 'information-outline' },
    ]

    render() {
        return (
            <ul class={[css(shape.size('100%', '100%'))]}>
                {this.links.map(props => (
                    <li class={[block]}>
                        <RoundedLink {...{ props }} />
                    </li>
                ))}
            </ul>
        )
    }
}
