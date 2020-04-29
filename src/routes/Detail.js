import React from "react";
import fetch from "node-fetch"
import {
  Image,
  Grid,
  Container,
  Label,
  Divider,
  Button,
  Icon
} from "semantic-ui-react";
import ReactMarkdown from 'react-markdown/with-html'
import config from "../config";

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null,
      error: null,
      isLoading: true,
      bot: {}
    };
  }

  getData = async id => {
    await fetch(config.api + "/bots/get/" + id)
      .then(r=> r.json())
      .then(bot=> this.setState({ bot: bot.code === 200 ? bot.data[0] : false, isLoading: false }))
      
    
  };

  componentDidMount(props) {
    const {
      match: {
        params: { id }
      }
    } = this.props;
    this.getData(id);
  }
  render() {
    const { bot, isLoading } = this.state;

    console.log(bot);
    return (
      <Container>
        <br />

        {isLoading ? (
          <div className="loader">
            <span>Loading...</span>
          </div>
        ) : bot ? (
          <>
            <Grid stackable divided="vertically">
              <Grid.Row columns={2}>
                <Grid.Column>
                  <Image
                    src={
                      "https://cdn.discordapp.com/avatars/" +
                      bot.id +
                      "/" +
                      bot.avatar +
                      ".webp"
                    }
                    size="medium"
                    rounded
                  />
                </Grid.Column>
                <Grid.Column>
                  <br />
                  <h1 style={{ fontSize: "50px" }}>
                    {bot.name}{" "}
                    {bot.trusted ? (
                      <Label className="discord">
                        <Icon className="icon mini check" /> 디스코드 인증됨
                      </Label>
                    ) : (
                      ""
                    )}
                    {bot.verified ? (
                      <Label className="green">
                        <Icon className="icon mini check" /> 신뢰함
                      </Label>
                    ) : (
                      ""
                    )}
                  </h1>
                  <Label>
                    상태
                    <Label.Detail>
                      <Label
                        circular
                        color={status[bot.status]}
                        empty
                        key="status"
                      />
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
                  <p style={{ marginTop: "10px", fontSize: "20px" }}>
                    {bot.intro}
                  </p>
                  <br />
                  <Label.Group tag>
                    카테고리 : <br />
                    {bot.category.length === 0
                      ? " 지정되지 않음"
                      : bot.category.map(c => (
                          <Label as="a" key={c}>
                            {c}
                          </Label>
                        ))}
                  </Label.Group>
                  <br />
                  {bot.url === "false" ? (
                    <Button
                      className="discord"
                      content="초대하기"
                      labelPosition="left"
                      icon="plus"
                      href={`https://discordapp.com/oauth2/authorize?client_id=${bot.id}&scope=bot&permissions=0`}
                    ></Button>
                  ) : (
                    <Button
                      className="discord"
                      content="초대하기"
                      labelPosition="left"
                      icon="discord"
                      href={bot.url}
                    ></Button>
                  )}
                  {bot.web === "false" ? (
                    ""
                  ) : (
                    <Button
                      color="blue"
                      content="웹사이트"
                      labelPosition="left"
                      icon="globe"
                      href={bot.web}
                    ></Button>
                  )}
                  {bot.discord === "false" ? (
                    ""
                  ) : (
                    <Button
                      className="discord"
                      content="지원 디스코드"
                      labelPosition="left"
                      icon="discord"
                      href={'https://discord.gg/' + bot.discord}
                    ></Button>
                  )}
                  {bot.git === "false" ? (
                    ""
                  ) : (
                    <Button
                      color="black"
                      content="Git"
                      labelPosition="left"
                      icon="git"
                      href={bot.git}
                    ></Button>
                  )}
                </Grid.Column>
              </Grid.Row>

              <Grid.Row columns={5}>
                <Grid.Column>
                  <Button
                    className="discord"
                    content={bot.servers === 0 ? "N/A" : bot.servers + " 서버"}
                  ></Button>
                  <Button
                    content={bot.votes}
                    color="red"
                    icon="heart"
                    labelPosition="right"
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </>
        ) : (
          <div className="loader">
            <h1>존재하지 않는 봇입니다!</h1>
          </div>
        )    }
        <div>
          제작자 :
          <img alt="img"
            src={
              "https://cdn.discordapp.com/avatars/" +
              bot.id +
              "/" +
              bot.avatar +
              ".webp"
            }
            className="ui avatar image"
          />
          <span>Username#Tag</span>
        </div>

        <Divider section />
        <ReactMarkdown style={{wordWrap: 'break-word'}}
     source={bot.desc}
    />
      </Container>
    );
  }
}

export default Detail;

const status = {
  online: "green",
  idle: "yellow",
  dnd: "red",
  offline: "gray",
  streaming: "purple"
};
