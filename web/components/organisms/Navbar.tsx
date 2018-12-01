import { css } from 'emotion'
import { Component } from 'vue-property-decorator'
import { VueT } from '../../utils/vue-tsx'
import { palette, position, shadow } from '../../variables/css'
import { flex, only } from '../../variables/directives'
import { RoundedLink } from '../atoms/RoundedLink'
import { Routes } from '../molecules/Routes'

interface Props {}

@Component
export class Navbar extends VueT<Props> implements Props {
    render() {
        return (
            <div>
                <nav class={[only.landscape, nav, css({ left: 0, height: '100%' })]}>
                    <Routes class={[flex({ vertical: true }, 'center', 'center')]} />
                    <div
                        class={[
                            css({
                                ...position.fixed,
                                right: 0,
                                bottom: 0,
                            }),
                        ]}
                    >
                        <RoundedLink
                            label="Tweet"
                            class={[css({ ...shadow.two.box })]}
                            borderless
                            external
                            size={48}
                            to={tweetUrl}
                            icon="twitter"
                            color={palette.cyan}
                        />
                    </div>
                </nav>

                <nav class={[only.portrait, nav, css({ bottom: 0, width: '100%' })]}>
                    <Routes class={[flex({}, 'space-evenly')]} />
                    <div
                        class={[
                            css({
                                ...position.absolute,
                                right: 0,
                                bottom: '100%',
                            }),
                        ]}
                    >
                        <RoundedLink
                            label="Tweet"
                            class={[css({ ...shadow.two.box })]}
                            borderless
                            external
                            size={40}
                            to={tweetUrl}
                            icon="twitter"
                            color={palette.cyan}
                        />
                    </div>
                </nav>
            </div>
        )
    }
}

const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    'ReinaInfo - 上田麗奈さん非公式Info'
)}&url=${encodeURIComponent(window.location.origin)}`

const nav = css({
    zIndex: 10,
    position: 'fixed',
    backgroundColor: palette.primary,
    ...shadow.two.box,
})
