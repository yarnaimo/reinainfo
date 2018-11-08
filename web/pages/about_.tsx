import { Component, Vue } from 'vue-property-decorator'
import { Link } from '../components/atoms/Link'
import { head } from '../utils/vue-tsx'
import { link } from '../variables/constants'
import { juliusFont } from '../variables/css'
import {
    container,
    mdih,
    pageContent,
    pageTitle,
} from '../variables/directives'

@Component(head('About'))
export default class extends Vue {
    render() {
        return (
            <main>
                <div class={pageTitle}>
                    <h1 class={juliusFont}>
                        <i class={mdih.one('information-outline')} />
                        About
                    </h1>
                </div>
                <div class={pageContent}>
                    <section class={[container]}>
                        <p>
                            声優・上田麗奈さんに関する情報を共有する非公式Webサイトです。本人・所属事務所・レコード会社等との関係はありません。
                        </p>
                        <p>
                            このサイトおよびTwitterに掲載する情報はその正確性を保証するものではありませんので、必ず公式サイト・公式アカウントでのご確認をお願いします。
                        </p>

                        <h2>サイト情報</h2>
                        <p>
                            このサイトはyamaimo (
                            <Link
                                to={link.twitterAdmin.url}
                                external
                                icon="twitter"
                            >
                                {link.twitterAdmin.screenName}
                            </Link>
                            ) が管理しています。
                        </p>
                        <p>
                            Twitterアカウント (
                            <Link to={link.twitter.url} external icon="twitter">
                                {link.twitter.screenName}
                            </Link>
                            ) がリツイートしたツイートや新規スケジュールは、
                            <Link to="/topic">Topicページ</Link>
                            で確認できます。
                        </p>

                        <p>
                            サイトおよびクラウドで稼働しているプログラムは、GitHubで公開しています。MITライセンスに基づき自由にご利用いただけます。
                        </p>
                        <p>
                            <Link
                                to={link.github}
                                external
                                icon="github-circle"
                            >
                                yarnaimo/reinainfo
                            </Link>
                        </p>
                    </section>
                </div>
            </main>
        )
    }
}
