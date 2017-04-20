import React from 'react';
import { Grid, Row, Col, Image } from 'react-bootstrap';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Me.scss';

import Tab from './Tab';
import TimeLine from '../../components/Common/TimeLine';

class Me extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isImage: true,
    };
  }
  handler = (state) => {

  }
  render() {
    const imageSrc = 'http://hdwallpaperfun.com/wp-content/uploads/2015/07/Awesome-Art-Landscape-Wallpaper.jpg';

    const numbers = 100;
    const createdAt = '20-04-2017';

    const events = [
      { time: createdAt,
        images: [imageSrc, imageSrc, imageSrc, imageSrc, imageSrc, imageSrc, imageSrc, imageSrc, imageSrc, imageSrc],
      },
    ];
    return (
      <Grid className={s.margintop30}>
        <Row >
          <Col sm={8} xs={12}>
            <div className={s.feedsContent}>

              <img className={s.image} src={imageSrc} />

              <span className={s.avartar}>
                <i className="fa fa-user-circle fa-4x" aria-hidden="true"></i>
                <div className={s.userName}>
                  <h1 >Leu Duc Quy </h1>
                </div>

              </span>
              <div className={s.infors}>


                <Tab numbers={numbers} onclicks={this.handler} />


              </div>

              <TimeLine events={events} />

            </div>
          </Col>
          <Col sm={4} xs={12}>
          test
          </Col>
        </Row >

      </Grid>

    );
  }
}

export default withStyles(s)(Me);
