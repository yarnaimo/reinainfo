import { css } from 'emotion'
import { Component, Emit, Prop } from 'vue-property-decorator'
import { VueT } from '../../utils/vue-tsx'
import { motion, palette, position, shadow, shape } from '../../variables/css'
import { clickable, flex, mdi } from '../../variables/directives'

interface Props {
    checked: boolean
    label: string
    color?: string
    right?: boolean
}

@Component
export class CSwitch extends VueT<Props> implements Props {
    @Prop()
    checked!: boolean

    @Prop()
    label!: string

    @Prop()
    color?: string

    @Prop()
    right?: boolean

    @Emit()
    change() {
        return !this.checked
    }

    render() {
        return (
            <div
                class={[
                    flex({ reverse: this.right }, 'start', 'center'),
                    css(position.relative),
                ]}
            >
                <input
                    type="checkbox"
                    aria-label={this.label}
                    onChange={this.change}
                    checked={this.checked}
                    class={[
                        clickable,
                        css(position.absoluteFit, {
                            opacity: 0,
                            zIndex: 10,
                        }),
                    ]}
                />
                <div
                    class={[
                        flex({}, 'center', 'center'),
                        css(shape.size(44, 30), position.relative),
                    ]}
                >
                    <div
                        class={[
                            css({
                                borderRadius: '13px / 12px',
                                height: 18,
                                width: 36,
                                backgroundColor: palette.base,
                                filter: shadow.zeroPale.drop,

                                ...motion(
                                    'std',
                                    ['backgroundColor', 'filter'],
                                    [0.25]
                                ),
                                'input:checked + div > &': {
                                    // backgroundColor: palette.white,
                                },
                            }),
                        ]}
                    />
                    <div
                        class={[
                            mdi('check'),
                            flex({}, 'center', 'center'),
                            css(position.absolute, {
                                ...shape.rounded,
                                ...shape.size(24),
                                top: '50%',
                                left: '50%',
                                borderStyle: 'solid',
                                borderWidth: 1,
                                color: palette.white,
                                fontSize: 18,
                                ...motion(
                                    'std',
                                    [
                                        'filter',
                                        'transform',
                                        'backgroundColor',
                                        'borderColor',
                                    ],
                                    [0.25]
                                ),
                                filter: shadow.one.drop,
                                backgroundColor: palette.white,
                                borderColor: palette.transparent,
                                transform:
                                    'translate(-50%, -50%) translateX(-9px)',

                                'input:checked + div > &': {
                                    filter: shadow.zero.drop,
                                    backgroundColor: this.color || palette.pink,
                                    borderColor: palette.hamEar,
                                    transform:
                                        'translate(-50%, -50%) translateX(9px)',
                                },
                            }),
                        ]}
                    />
                </div>
                <div class={[css({ width: 12 })]} />
                <label>
                    <small>{this.label}</small>
                </label>
            </div>
        )
    }
}
