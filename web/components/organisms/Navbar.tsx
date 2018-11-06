import { css } from 'emotion'
import { Component } from 'vue-property-decorator'
import { VueT } from '../../utils/vue-tsx'
import { palette, shadow } from '../../variables/css'
import { flex, only } from '../../variables/directives'
import { Routes } from '../molecules/Routes'

interface Props {}

@Component
export class Navbar extends VueT<Props> implements Props {
    render() {
        return (
            <div class={[flex(), css({ zIndex: 10 })]}>
                <nav
                    class={[
                        only.landscape,
                        flex({ vertical: true }, 'center', 'stretch'),
                        css({
                            // ...shape.size(210, '100vh'),
                            // ...media.low({
                            //     width: 170,
                            // }),
                            height: '100vh',
                            backgroundColor: palette.primary,
                            filter: shadow.one.drop,
                        }),
                    ]}
                >
                    <Routes class={flex({ vertical: true }, 'space-around')} />
                </nav>

                <nav
                    class={[
                        only.portrait,
                        flex({ vertical: true }),
                        css({
                            width: '100vw',
                            backgroundColor: palette.primary,
                            filter: shadow.one.drop,
                        }),
                    ]}
                >
                    <Routes
                        class={css({
                            justifyContent: 'space-evenly',
                        })}
                    />
                </nav>
            </div>
        )
    }
}
