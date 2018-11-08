import { css } from 'emotion'
import { Component } from 'vue-property-decorator'
import { VueT } from '../../utils/vue-tsx'
import { juliusFont, palette } from '../../variables/css'
import { flex, mdi } from '../../variables/directives'

interface Props {}

@Component
export class ComingSoon extends VueT<Props> implements Props {
    render() {
        return (
            <div
                class={[
                    flex({ vertical: true }, 'center', 'center'),
                    css({
                        flexGrow: 1,
                        fontSize: '1.5em',
                        color: palette.brown,
                        // filter: shadow.zeroPale.drop,
                    }),
                ]}
            >
                <i class={[mdi('shovel'), css({ fontSize: '2.5em' })]} />
                <p class={[juliusFont]}>Coming Soon</p>
            </div>
        )
    }
}
