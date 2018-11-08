import { css } from 'emotion'
import { Component, Emit, Prop } from 'vue-property-decorator'
import { VueT } from '../../utils/vue-tsx'
import { motion, position } from '../../variables/css'
import { cmdi } from '../../variables/directives'

interface Props {
    expanded: boolean
}

interface Events {
    onToggle: () => void
}

@Component
export class DropdownChevron extends VueT<Props, Events> implements Props {
    @Prop()
    expanded!: boolean

    @Emit()
    toggle() {}

    render() {
        return (
            <button
                onClick={this.toggle}
                aria-label="Expand"
                class={[
                    cmdi('chevron-down'),
                    css(
                        {
                            ...position.absolute,
                            fontSize: '1.5em',
                            ...motion('dec', ['transform'], [0.3]),
                            transformOrigin: '50% 45.625%',
                            '::before': { display: 'block' },
                        },
                        this.expanded && {
                            transform: 'rotate(180deg)',
                        }
                    ),
                ]}
            />
        )
    }
}
