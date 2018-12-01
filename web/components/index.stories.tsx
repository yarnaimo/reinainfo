import { storiesOf } from '@storybook/vue'
import { ComponentOptions } from 'vue'
import { Component, Vue } from 'vue-property-decorator'
import { scheduleFixture } from '../../src/__fixtures__/models.Schedule'
import { flex } from '../variables/directives'
import { CSwitch } from './atoms/CSwitch'
import CSchedule from './molecules/CSchedule'
import { CTweet } from './molecules/CTweet'
import { Navbar } from './organisms/Navbar'

storiesOf('Organisms', module)
    .add('Navbar', () => ({
        render() {
            return <Navbar />
        },
    }))
    .add(
        'Switch',
        () =>
            Component(
                class C extends Vue {
                    checked = true

                    toggle(newVal: boolean) {
                        this.checked = newVal
                    }
                    render() {
                        return (
                            <div class={[flex({ vertical: true }, 'center', 'center')]}>
                                <CSwitch
                                    label="Label"
                                    checked={this.checked}
                                    onChange={this.toggle}
                                />
                                <span>{`${this.checked}`}</span>
                            </div>
                        )
                    }
                }
            ) as ComponentOptions<Vue>
    )

storiesOf('Molecules', module)
    .add('CTweet', () => ({
        render() {
            return <CTweet id="1033928851582201856" />
        },
    }))
    .add('CSchedule', () => ({
        render() {
            return (
                <div>
                    <CSchedule schedule={scheduleFixture()} />
                    <CSchedule schedule={scheduleFixture('up')} />
                    <CSchedule schedule={scheduleFixture('release')} />
                </div>
            )
        },
    }))
