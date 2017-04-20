import React from 'react';
import { Grid, Row, Col, Image } from 'react-bootstrap';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Me.scss';

import Tab from './Tab';
import TimeLine from '../../components/Common/TimeLine';

class Me extends React.Component {


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
      <div className={s.root}>
        <Row className={s.container}>
          <Col>
            <div className={s.feedsContent}>

              <img className={s.image} src={imageSrc} />

              <span className={s.avartar}>
                <i className="fa fa-user-circle fa-4x" aria-hidden="true"></i>
                <div className={s.userName}>
                  <h1 >Leu Duc Quy </h1>
                </div>

              </span>
              <div className={s.infors}>


               <Tab numbers = {numbers} />
                

              </div>
              
              <TimeLine events={events} />

            </div>
          </Col>
        </Row >

      </div>

    );
  }
}

export default withStyles(s)(Me);
