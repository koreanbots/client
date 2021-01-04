import React from 'react'
import {
  Image,
  Grid,
  Container,
  Label,
  Divider,
  Button,
  Icon,
  Message,
  Segment,
  Popup,
  Table,
  Modal,
  Form,
  TextArea,
  Advertisement
} from 'semantic-ui-react'
import ReactMarkdown from 'react-markdown/with-html'
import config from '../config'
import { HelmetProvider } from 'react-helmet-async'
import CodeBlock from '../components/Code'
import graphql from '../utils/graphql'
import Adsense from '../components/Advertisement'
import Permission from '../utils/permission'
import { Link } from 'react-router-dom'
import Redirecting from '../components/Redirect'

class Detail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      result: null,
      error: {},
      isLoading: true,
      bot: {},
      popup: false,
      report: 0,
      reportCategory: '',
      reportDesc: ''
    }
  }

  getData = async id => {
    const bot = await graphql(`query {
      bot(id: "${encodeURIComponent(id)}") {
        id
        lib
        prefix
        votes
        servers
        intro
        desc
        web
        git
        url
        category
        status
        name
        avatar
        tag
        verified
        trusted
        partnered
        discord
        boosted
        state
        vanity
        bg
        banner
        owners {
          id
          avatar
          tag
          username
        }
      }
    }`)


    this.setState({
      bot: bot.code === 200 && bot.data.bot ? bot.data.bot : null,
      isLoading: false,
      error: bot.code !== 200 ? bot.message : !bot.data.bot ? '존재하지 않는 봇입니다' : '',
      user: localStorage.userCache ? JSON.parse(localStorage.userCache) : { }
    })
  }

  voteAction = async () => {
    const res = await fetch(config.api + '/bots/vote/' + this.state.bot.id, {
      method: 'POST',
      headers: {
        token: localStorage.token,
        id: localStorage.id,
        time: localStorage.date
      }
    }).then(r => r.json())
    if (res.code !== 200) return (window.location.href = '/login')
    else {

      this.setState({ votes: res.count, voted: res.state })
      this.setState({ bot: this.state.bot })
    }
  }

  report = async () => {
    const res = await graphql(`mutation {
      report(id: "${this.state.bot.id}", type: bot, category: "${this.state.reportCategory}", desc: "${this.state.reportDesc.replace(/\n/g, '\\n').replace(/"/g, '\\"')}") {
        id
    }
}`)
    if (res.code !== 200) {
      this.setState({ report: res.message })
    } else {
      window.location.href = '/?message=reportSuccess'
    }
  }

  componentDidMount() {
    const {
      match: {
        params: { id }
      }
    } = this.props
    this.getData(id)
  }
  render() {
    const { bot, isLoading } = this.state
    return (
        <>
            {isLoading ? (
              <div className="loader">
                <span>Loading...</span>
              </div>
            ) : !this.state.error ? (bot.trusted || bot.boosted) && bot.vanity && this.props.match.params.id !== bot.vanity ? (
              <div className="loader">
                <Redirecting to={`/bots/${bot.vanity}`}/>

              </div>
            ) : (
              <div
            className="botDetail"
            style={{ minHeight: '100vh' }}
          >
            <div style={
              (bot.boosted && bot.bg) || (bot.trusted && bot.bg)
                ? { 
                    padding: '30px 0',
                    minHeight: '100vh',
                    paddingBottom: '30px',
                    color: 'white',
                    background: `linear-gradient(to right, rgba(34, 36, 38, 0.68), rgba(34, 36, 38, 0.68)), url(${bot.bg}) top/cover no-repeat fixed`
                  }
                : { padding: '30px 0' }
            }>
              <br/>
          <Container>
                <HelmetProvider>
                  <title>{`${bot.name} - 한국 디스코드봇 리스트`}</title>
                </HelmetProvider>
                {bot.state === 'private' ? (
                  <Message>
                    해당 봇은 특수목적 봇이므로 초대하실 수 없습니다.
                  </Message>
                ) : bot.state === 'archived' ? (
                  <Message error>
                    해당 봇은 잠금 상태입니다.
                    <br />
                    일부 행동이 제한될 수 있습니다.
                  </Message>
                ) :  bot.state === 'reported' ? (
                  <Message error>
                    해당 봇은 신고가 접수되어, 관리자에 의해 잠금 상태입니다.
                    <br />
                    <a href="/guidelines">가이드라인</a>에 대한 위반사항을 확인해주시고 <a href="/discord">디스코드 서버</a>로 문의해주세요.
                  </Message>
                ) : (
                  <></>
                )}
                <Grid stackable divided="vertically">
                  <Grid.Row columns={2}>
                    <Grid.Column>
                      <Image
                        src={
                          bot.avatar
                            ? 'https://cdn.discordapp.com/avatars/' +
                              bot.id +
                              '/' +
                              bot.avatar +
                              '.png?size=1024'
                            : `https://cdn.discordapp.com/embed/avatars/${bot.tag %
                                5}.png?size=1024`
                        }
                        onError={ (e)=> e.target.src="/img/default.png" }
                        size="medium"
                        rounded
                      />
                    </Grid.Column>
                    <Grid.Column>
                      <h1 style={{ fontSize: '50px' }}>{bot.name} </h1>
                      {bot.verified ? (
                        <Popup
                          content="해당봇은 디스코드측에서 인증한 봇입니다!"
                          trigger={
                            <Label
                              className="discord"
                            >
                              <Icon className="icon check" /> 디스코드 인증됨
                            </Label>
                          }
                        />
                      ) : (
                        ''
                      )}

                      {bot.trusted ? (
                        <Popup
                          content="해당봇은 디스코드봇 인증을 받은 봇입니다. 엄격한 기준을 통과한 봇입니다! 더 알아보시려면 클릭해보세요!"
                          position="left"
                          trigger={
                            <Label
                              className="noHover trusted"
                              href="/verification"
                            >
                              <Icon className="icon certificate" /> 신뢰함
                            </Label>
                          }
                        />
                      ) : (
                        ''
                      )}
                      {bot.boosted ? (
                        <Popup
                          content="해당봇은 공식 디스코드에 부스터가 소유하고 있는봇입니다!"
                          position="right"
                          trigger={
                            <Label
                              href="/boost"
                              className="noHover boosted"
                            >
                              <Icon className="icon diamond" /> 부스트
                            </Label>
                          }
                        />
                      ) : (
                        ''
                      )}
                      <br />
                      <br />
                      <Label>
                        상태
                        <Label.Detail>
                          <Icon
                            className="circle"
                            color={status[bot.status]}
                            key="status"
                          />{' '}
                          {statusText[bot.status]}
                        </Label.Detail>
                      </Label>

                      <Label>
                        접두사
                        <Label.Detail>{bot.prefix}</Label.Detail>
                      </Label>
                      <Label>
                        라이브러리
                        <Label.Detail>{bot.lib}</Label.Detail>
                      </Label>
                      <br />
                      <p style={{ marginTop: '10px', fontSize: '20px' }}>
                        {bot.intro}
                      </p>
                      <br />
                      <Label.Group tag>
                        카테고리 : <br />
                        {bot.category.length === 0
                          ? ' 지정되지 않음'
                          : bot.category.map(c => (
                              <Label as="a" key={c} href={'/categories/' + c}>
                                {c}
                              </Label>
                            ))}
                      </Label.Group>
                      <br />
                      <div className="buttons">
                        <Button
                          disabled={
                            bot.state === 'private' || bot.state === 'archived' || bot.state === 'reported'
                          }
                          className="yellow"
                          content="초대하기"
                          labelPosition="left"
                          icon="plus"
                          href={bot.url || `https://discordapp.com/oauth2/authorize?client_id=${bot.id}&scope=bot&permissions=0`}
                        ></Button>
                      
                      {bot.web && (
                        <Button
                          color="blue"
                          content="웹사이트"
                          labelPosition="left"
                          icon="globe"
                          href={bot.web}
                        ></Button>
                      )}
                      {bot.discord && (
                        <Button
                          className="discord"
                          content="지원 디스코드"
                          labelPosition="left"
                          icon="discord"
                          href={'https://discord.gg/' + bot.discord}
                        ></Button>
                      )}
                      {bot.git && (
                        <Button
                          color="black"
                          content="Git"
                          labelPosition="left"
                          icon="git"
                          href={bot.git}
                        ></Button>
                      )}

                      <Modal
                        className={localStorage.dark === 'true' ? 'darkmode' : 'lightmode'}
                        trigger={
                          <Button color="red">
                            <Icon className="flag outline" />
                            신고하기
                          </Button>
                        }
                        closeIcon
                      >
                        <Modal.Header>
                          {bot.name}#{bot.tag} 신고하기
                        </Modal.Header>
                        <Modal.Description>
                          <Container style={{ padding: '10px' }}>
                            <Form>
                              <h3>신고 구분</h3>
                              {[
                                '불법',
                                '괴롭힘, 모욕, 명예훼손',
                                '스팸, 도배, 의미없는 텍스트',
                                '폭력, 자해, 테러 옹호하거나 조장하는 컨텐츠',
                                '라이선스혹은 권리 침해',
                                'Discord ToS 위반',
                                'Koreanbots 가이드라인 위반',
                                '기타'
                              ].map(el => (
                                <Form.Radio
                                  checked={el === this.state.reportCategory}
                                  label={el}
                                  value={el}
                                  onChange={(_e, { value }) =>
                                    this.setState({ reportCategory: value })
                                  }
                                />
                              ))}
                              <h3>설명</h3>
                              마크다운을 지원합니다.<br/><br/>
                              <TextArea
                                maxLength={1000}
                                value={this.state.desc}
                                onChange={(_e, { value }) =>
                                  this.setState({ reportDesc: value })
                                }
                              />
                              <br />
                              <br />
                              <br />
                              지속적인 허위 신고혹은 장난 신고는 제재대상입니다.
                              <br /><br/>
                              <Button
                                primary
                                content="제출"
                                onClick={this.report}
                              />
                            </Form>
                            {this.state.report === 0 ? (
                              <></>
                            ) : (
                              <Message error>{this.state.report}</Message>
                            )}
                          </Container>
                        </Modal.Description>
                      </Modal>
                      {
                        (Permission.check(this.state.user.perm, 'staff') || bot.owners.find(el=> el.id === this.state.user.id)) && (
                        <Button color="grey" as={Link} to={`/manage/${bot.id}`}>
                          <Icon className="flag settings" />
                          관리하기
                        </Button>)
                      }
                      </div>
                    </Grid.Column>
                  </Grid.Row>

                  <Grid.Row columns={2}>
                    <Grid.Column>
                      <Button
                        className="discord"
                        content={
                          (bot.servers === 0 ? '0' : bot.servers) + ' 서버'
                        }
                      ></Button>

                      <Button
                        basic={bot.voted === 1 ? false : true}
                        color="red"
                        content={bot.voted === 1 ? '하트 삭제' : '하트 추가'}
                        icon="heart"
                        disabled={bot.state === 'archived' || bot.state === 'reported'}
                        label={{
                          basic: true,
                          color: 'red',
                          pointing: 'left',
                          content: bot.votes
                        }}
                        onClick={this.voteAction}
                      />

                      <br />
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                <div>
                  제작/개발:{' '}
                  {(bot.owners || []).map(o => (
                    <Label href={'/users/' + o.id}>
                      <Image
                        src={
                          o.avatar ?
                            'https://cdn.discordapp.com/avatars/' +
                              o.id +
                              '/' +
                              o.avatar +
                              '.png' : `https://cdn.discordapp.com/embed/avatars/${o.tag %
                              5}.png`
                          }
                        onError={ (e)=> e.target.src="/img/default.png" }
                        avatar
                        />
                        <span>
                          {' '}
                          {o.username}#{o.tag}
                        </span>
                    </Label>
                  ))}
                </div>
                <Adsense />

                <Divider section />
                <Segment
                  style={{
                    wordWrap: 'break-word',
                    borderRadius: 0,
                    color: 'black'
                  }}
                >
                  <ReactMarkdown
                    source={bot.desc.replace(/!\[(.*?)\]\((.*?)\)/g, function(whole, alt, link){
                      let isURL
                      try {
                      isURL = new URL(link)
                      } catch(e) {
                      isURL = false
                      }
                      console.log(isURL)
                      if(!isURL) return `![${alt}](${link})`
                      else return `![${alt}](https://cdn.statically.io/img/${isURL.host}${isURL.pathname}${isURL.search})`
                      })}
                    renderers={{
                      table: Table,
                      thead: Table.Header,
                      tr: Table.Cell,
                      code: CodeBlock
                    }}
                  />
                </Segment>
                </Container>
                </div>
              </div>
            ) : (
              <div className="loader">
                <p>{this.state.error}</p>
              </div>
            )}
            </>
    )
  }
}

export default Detail

const status = {
  online: 'green',
  idle: 'yellow',
  dnd: 'red',
  offline: 'gray',
  streaming: 'purple'
}

const statusText = {
  online: '온라인',
  idle: '자리 비움',
  dnd: '다른 용무중',
  offline: '오프라인',
  streaming: '방송중',
  '???': '알 수 없음'
}