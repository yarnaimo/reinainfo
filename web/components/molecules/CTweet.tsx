import { css } from 'emotion'
import { Component, Prop } from 'vue-property-decorator'
import { Tweet } from 'vue-tweet-embed'
import { VueT } from '../../utils/vue-tsx'
import { margin } from '../../variables/css'

interface Props {
    id: string
}

@Component
export class CTweet extends VueT<Props> implements Props {
    @Prop()
    id!: string

    render() {
        return (
            <Tweet
                ref="tweet"
                class={[css(margin(0, -2))]}
                id={this.id}
                options={{ lang: 'ja', width: '600' }}
            />
        )
    }
}
