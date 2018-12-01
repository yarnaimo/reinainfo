import Vue, { ComponentOptions } from 'vue'
import { Component } from 'vue-tsx-support'

type Optional<T> = { [P in keyof T]+?: T[P] }

export class VueT<Props = {}, EventsWithOn = {}, ScopedSlotArgs = {}> extends Component<
    Props & Optional<JSX.IntrinsicElements>,
    EventsWithOn,
    ScopedSlotArgs
> {}

const meta = (name: string, content: string, options = {}) => ({
    ...(name.startsWith('og:') ? { property: name } : { name }),
    content,
    ...options,
})

export const head = (title: string) =>
    ({
        head() {
            return {
                title,
            }
        },
    } as ComponentOptions<Vue>)
