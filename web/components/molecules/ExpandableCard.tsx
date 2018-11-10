import { css, cx } from 'emotion'
import { Component, Prop } from 'vue-property-decorator'
import { VueT } from '../../utils/vue-tsx'
import {
    margin,
    media,
    padding,
    palette,
    position,
    shadow,
} from '../../variables/css'
import { block, clickable, mdi } from '../../variables/directives'
import { DropdownChevron } from '../atoms/DropdownChevron'

interface HeaderProps {
    color?: string
    icon?: string
    title?: string
}

interface Props {
    header?: HeaderProps
}

@Component
export default class ExpandableCard extends VueT<Props> implements Props {
    @Prop()
    header!: HeaderProps

    expanded: boolean = false

    toggle() {
        this.expanded = !this.expanded
    }

    render() {
        return (
            <li
                class={cx(
                    block,
                    css({
                        overflow: 'hidden',
                        ...margin(12, -2),
                        ...shadow.one.box,
                        borderRadius: 6,
                        backgroundColor: palette.white,
                        color: palette.black,
                        ...media.narrow(margin(10, -2)),
                    })
                )}
            >
                {this.header && (
                    <div
                        class={[
                            contentWrapper,
                            css({
                                ...position.relative,
                                backgroundColor: this.header.color,
                                color: palette.white,
                            }),
                        ]}
                    >
                        <div class={[content]}>
                            {this.header.icon && (
                                <i
                                    class={[
                                        mdi(this.header.icon),
                                        css({
                                            ...position.absolute,
                                            fontSize: '2.75em',
                                            top: 2,
                                            right: 4,
                                            opacity: 0.25,
                                            color: palette.black,
                                        }),
                                    ]}
                                />
                            )}
                            <DropdownChevron
                                expanded={this.expanded}
                                onToggle={this.toggle}
                                class={css({
                                    bottom: 6,
                                    right: 6,
                                })}
                            />
                            {this.$slots.headerTop && (
                                <p
                                    class={css({
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        filter: shadow.zero.drop,
                                    })}
                                >
                                    {this.$slots.headerTop}
                                </p>
                            )}
                            {this.header.title && (
                                <h3
                                    onClick={this.toggle}
                                    class={[
                                        clickable,
                                        css({ filter: shadow.zero.drop }),
                                    ]}
                                >
                                    {this.header.title}
                                </h3>
                            )}
                        </div>
                    </div>
                )}
                <div v-show={this.expanded} class={[contentWrapper]}>
                    <div class={[content]}> {this.$slots.content}</div>
                </div>
            </li>
        )
    }
}

const content = css(margin(10, 0))

const contentWrapper = css({
    ...padding(2, 32),
    ...media.narrow(padding(0.1, 20)),
})
