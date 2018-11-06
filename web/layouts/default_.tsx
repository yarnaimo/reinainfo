import { css } from 'emotion'
import { Component, Vue } from 'vue-property-decorator'
import { Logo } from '../components/atoms/Logo'
import { Navbar } from '../components/organisms/Navbar'
import { margin, media, palette, shadow } from '../variables/css'
import { flex, wideContainer } from '../variables/directives'

@Component
export default class DefaultLayout extends Vue {
    private logoLine = css({
        height: 1,
        flexGrow: 1,
        backgroundColor: palette.brown,
    })

    render() {
        return (
            <div
                class={[
                    flex({}, 'start', 'stretch'),
                    css({
                        height: '100vh',
                        ...media.portrait({ flexDirection: 'column-reverse' }),
                    }),
                ]}
            >
                <Navbar />
                <div
                    class={[
                        css({
                            overflow: 'scroll',
                            flexGrow: 1,
                            height: '100%',
                        }),
                    ]}
                >
                    <div
                        class={[
                            flex({ vertical: true }),
                            css({ minHeight: '100%' }),
                        ]}
                    >
                        <header
                            class={[
                                wideContainer,
                                flex({}, 'space-around', 'center'),
                                css({
                                    paddingTop: 10,
                                    paddingBottom: 2,
                                    filter: shadow.zeroPale.drop,
                                }),
                            ]}
                        >
                            <div class={this.logoLine} />
                            <Logo
                                color={palette.brown}
                                class={css(margin(0, 32), {
                                    width: 200,
                                    ...media.narrow({ width: 160 }),
                                })}
                            />
                            <div class={this.logoLine} />
                        </header>

                        <nuxt
                            class={[
                                css({
                                    flexGrow: 1,
                                }),
                                flex({ vertical: true }, 'start', 'stretch'),
                            ]}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
