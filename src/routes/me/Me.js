import React from 'react';
import { Grid, Row, Col, Image } from 'react-bootstrap';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Me.scss';
import TextTitle from './TextTitle';
import Eventtime from '../../components/Common/Eventtime';

class Me extends React.Component {


  render() {
    const imageSrc = 'http://hdwallpaperfun.com/wp-content/uploads/2015/07/Awesome-Art-Landscape-Wallpaper.jpg';

    const title = 'Ảnh(200)';
    const createdAt = '20-04-2017';
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
              <div className = {s.infors}>


                <TextTitle title={title} />

                <h4 className={s.textInline}>Thông tin</h4>


              </div>
            </div>

          </Col>

        </Row>
        <Row className={s.container}>
          <Col>
          <div className={s.feedsContent}>
            <Eventtime
              createdAt={createdAt} element={

                <div className={s.infor} >
                  <Image src={imageSrc} thumbnail />
                  <Image src={imageSrc} thumbnail />
                  <Image src={imageSrc} thumbnail />
                  <Image src={imageSrc} thumbnail />
                  <Image src={imageSrc} thumbnail />
                  <Image src={imageSrc} thumbnail />
                  <Image src={imageSrc} thumbnail />
                  <Image src={imageSrc} thumbnail />
                  <Image src={imageSrc} thumbnail />
                  <Image src={imageSrc} thumbnail />

                </div>
              }
            />

        
          </div>
          </Col>


        </Row>
      </div>
    );
  }
}

export default withStyles(s)(Me);
