import React, { PropTypes } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Me.scss';
import TextTitle from './TextTitle';
import { Timeline, Bookmark } from 'react-vertical-timeline';

class Me extends React.Component {


  render() {
    const imageSrc = 'http://hdwallpaperfun.com/wp-content/uploads/2015/07/Awesome-Art-Landscape-Wallpaper.jpg';

    const title = 'Ảnh(200)';
    return (
      <div className={s.root}>
        <Row className={s.container}>
          <Col>
            <div className={s.feedsContent}>

              <img className={s.image} src={imageSrc} />

              <span className={s.avartar}>
                <i className="fa fa-user-circle fa-2x" aria-hidden="true"></i>
                <div className={s.userName}>
                  <h1 >Leu Duc Quy </h1>
                </div>

              </span>
              <div className={s.infor}>


                <TextTitle title={title} />

                <h4 className={s.textInline}>Thông tin</h4>


              </div>
            </div>

          </Col>

        </Row>
        <Row className={s.container}>
          <Col>
            <div className={s.feedsContent}>

              <Timeline height={300} progress={50} >
                <Bookmark progress={20} >
                Hi there 20%
              </Bookmark>
                <Bookmark progress={55} >
                Hi there 55%
              </Bookmark>
                <Bookmark progress={75} >
                Hi there 75%
              </Bookmark>
              </Timeline>

            </div>
          </Col>

        </Row>
      </div>
    );
  }
}

export default withStyles(s)(Me);
