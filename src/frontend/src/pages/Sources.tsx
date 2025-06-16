import { APP_STRINGS } from '../constants/strings';

import { Link } from 'react-router-dom';

const Sources = () => {

  return (
    <div>
   
      <main>
      <div className='main-page-wrap'>
          <h1>{APP_STRINGS.SOURCES_TITLE}</h1>
          {/* Add your Sources content here */}
          <h2>The Lake Pulse Toolbox has been leveraged to produce more health & safety data on your lake</h2>
          
          <div className='collection-wrap'>

          <div className='collection-item'>
              <i className='fa-thin fa-camera' aria-hidden='true'></i>
              <Link to='/photography'>
                <h3>Photography</h3>
              </Link>
              <p>Lake related photographs.</p>
            </div>

            <div className='collection-item'>
              <i className='fa-thin fa-microscope' aria-hidden='true'></i>
              <Link to='/lab_results'>
                <h3>Lab Results</h3>
              </Link>
              <p>Raw data from the lab sampling that has been produced on your lake.</p>
            </div>
            
            <div className='collection-item'>
              <i className='fa-thin fa-drone-front' aria-hidden='true'></i>
              <Link to='/drone'>
                <h3>Drone</h3>
              </Link>
              <p>Images from the drone monitoring that has been produced on your lake.</p>
            </div>
            
            <div className='collection-item'>
              <i className='fa-thin fa-satellite' aria-hidden='true'></i>
              <Link to='/satelite'>
                <h3>Satellite</h3>
              </Link>
              <p>Images from the satellite monitoring that has been produced on your lake.</p>
            </div>
            
            <div className='collection-item'>
              <i className='fa-thin fa-vial-circle-check' aria-hidden='true'></i>
              <Link to='/sources_fieldtesting'>
                <h3>Field Testing</h3>
              </Link>
              <p>Raw data from the field testing that has been produced on your lake.</p>
            </div>
            
            <div className='collection-item'>
              <i className='fa-thin fa-buoy' aria-hidden='true'></i>
              <Link to='/sources_insitumonitoring'>
                <h3>In-situ Monitoring</h3>
              </Link>
              <p>Raw data from the buoys and dock monitoring that has been produced on your lake.</p>
            </div>

            <div className='collection-item'>
              <i className='fa-thin fa-cloud-arrow-up' aria-hidden='true'></i>
              <Link to='/sources_historicreports'>
                <h3>Historic Reports Uploaded</h3>
              </Link>
              <p>Historic reports on your lake that have been uploaded, with key data already extracted.</p>
            </div>
            
          </div> 
           
        </div>
      </main>
    </div>
  );
};

export default Sources;
