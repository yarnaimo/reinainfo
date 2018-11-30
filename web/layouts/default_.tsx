import { css } from 'emotion'
import { Component, Vue } from 'vue-property-decorator'
import { Logo } from '../components/atoms/Logo'
import { withNavbar } from '../components/atoms/RoundedLink'
import { Navbar } from '../components/organisms/Navbar'
import { tuex } from '../tuex'
import { margin, media, palette, shadow } from '../variables/css'
import { flex, wideContainer } from '../variables/directives'

@Component
export default class DefaultLayout extends Vue {
    created() {
        tuex.store.initialize()
    }

    private logoLine = css({
        height: 1,
        flexGrow: 1,
        backgroundColor: palette.brown,
    })

    render() {
        return (
            <div class={[flex({ vertical: true }), css({ minHeight: '100vh' }), withNavbar()]}>
                <Navbar />

                <header
                    class={[
                        wideContainer,
                        flex({}, 'space-around', 'center'),
                        css({
                            paddingTop: 12,
                            paddingBottom: 6,
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
        )
    }
}
