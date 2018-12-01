import { css } from 'emotion'
import { Component, Emit, Prop } from 'vue-property-decorator'
import { VueT } from '../../utils/vue-tsx'
import { position } from '../../variables/css'
import { block, cmdi } from '../../variables/directives'

interface Props {
    expanded: boolean
}

interface Events {
    onToggle: () => void
}

@Component
export class DropdownChevron extends VueT<Props, Events> implements Props {
    @Prop() expanded!: boolean

    @Emit()
    toggle() {}

    render() {
        return (
            <button
                onClick={this.toggle}
                aria-label="Expand"
                class={[
                    block,
                    css(position.absolute, {
                        fontSize: '1.5em',
                    }),
                ]}
            >
                <div class={[cmdi('chevron-down'), chevronClass(!this.expanded)]} />
                <div class={[cmdi('chevron-up'), chevronClass(this.expanded)]} />
            </button>
        )
    }
}

const chevronClass = (visible: boolean) =>
    css(position.absolute, {
        opacity: visible ? 1 : 0,
        right: 0,
        bottom: 0,
        '::before': { display: 'block' },
    })
