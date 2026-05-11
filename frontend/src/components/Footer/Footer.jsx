import React from 'react';
import { MDBFooter, MDBContainer, MDBRow, MDBCol, MDBIcon } from 'mdb-react-ui-kit';
// import './Footer.css'

export default function App() {
  return (
    //   <MDBFooter className='text-center text-lg-start text-muted' style={{ backgroundColor: '#E0F7EF' }}>
    <MDBFooter bgColor='light' className='text-center text-lg-start text-muted'>
      <section className='d-flex justify-content-center justify-content-lg-between p-4 border-bottom'>
        <div className='me-5 d-none d-lg-block'>
          <span>Get connected with us on social networks:</span>
        </div>

        <div>
          <a href='' className='me-4 text-reset'>
            <MDBIcon fab icon="facebook-f" />
          </a>
          <a href='' className='me-4 text-reset'>
            <MDBIcon fab icon="twitter" />
          </a>
          <a href='' className='me-4 text-reset'>
            <MDBIcon fab icon="google" />
          </a>
          <a href='' className='me-4 text-reset'>
            <MDBIcon fab icon="instagram" />
          </a>
          <a href='' className='me-4 text-reset'>
            <MDBIcon fab icon="linkedin" />
          </a>
          <a href='' className='me-4 text-reset'>
            <MDBIcon fab icon="github" />
          </a>
        </div>
      </section>

      <section className=''>
        <MDBContainer className='text-center text-md-start mt-5'>
          <MDBRow className='mt-3'>
            <MDBCol md="3" lg="4" xl="3" className='mx-auto mb-4'>
              <h4 className='fw-bold mb-4'>
                <MDBIcon icon="gem" className="me-3" style={{color:"green"}}/>
                ClimaCare
              </h4>
              <p>
              IoT-based weather monitoring system that monitors real-time weather data, providing valuable insights for better decision-making and safety.
              </p>
            </MDBCol>

            <MDBCol md="2" lg="2" xl="2" className='mx-auto mb-4'>
              <h6 className='text-uppercase fw-bold mb-4'>Products</h6>
              <p>
                <a href='#!' className='text-decoration-none text-reset'>
                  Temperature
                </a>
              </p>
              <p>
                <a href='#!' className='text-decoration-none text-reset'>
                  Humidity
                </a>
              </p>
              <p>
                <a href='#!' className='text-decoration-none text-reset'>
                  Gas Level
                </a>
              </p>
              <p>
                <a href='#!' className='text-decoration-none text-reset'>
                  Pressure Level
                </a>
              </p>
              <p>
                <a href='#!' className='text-decoration-none text-reset'>
                  Rain Density
                </a>
              </p>
            </MDBCol>

            <MDBCol md="4" lg="3" xl="3" className='mx-auto mb-md-0 mb-4'>
              <h6 className='text-uppercase fw-bold mb-4'>Contact</h6>
              <p>
                <MDBIcon icon="home" className="me-2" /> Kaliakoir, Gazipur, Bangladesh
              </p>
              <p>
                <MDBIcon icon="envelope" className="me-3" />climacare@gmail.com
              </p>
              <p>
                <MDBIcon icon="phone" className="me-3" />+880 1798709761
              </p>
              <p>
                <MDBIcon icon="print" className="me-3" />+880 1640050330
              </p>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>

      {/* <div className='text-center p-4' style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}> */}
      <div className='text-center p-3' style={{ backgroundColor: '#b9fde5' }}>
        © 2024 Copyright :
        <a className='text-decoration-none text-reset fw-bold' href='https://avik-halder.vercel.app/'> Team_VOID()</a>
      </div>
    </MDBFooter>
  );
}