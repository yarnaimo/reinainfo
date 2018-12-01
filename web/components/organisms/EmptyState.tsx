import { css } from 'emotion'
import { Component, Prop } from 'vue-property-decorator'
import { VueT } from '../../utils/vue-tsx'
import { juliusFont, palette } from '../../variables/css'
import { flex, mdi } from '../../variables/directives'

interface Props {
    icon: string
    text: string
}

@Component
export class EmptyState extends VueT<Props> implements Props {
    @Prop() icon!: string

    @Prop() text!: string

    render() {
        return (
            <div
                class={[
                    flex({ vertical: true }, 'center', 'center'),
                    css({
                        flexGrow: 1,
                        fontSize: '1.25em',
                        color: palette.brown,
                        // filter: shadow.zeroPale.drop,
                    }),
                ]}
            >
                <i class={[mdi(this.icon), css({ fontSize: '2.75em' })]} />
                <p class={[juliusFont]}>{this.text}</p>
            </div>
        )
    }
}
