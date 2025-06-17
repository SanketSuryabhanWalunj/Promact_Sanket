import { APP_STRINGS } from '../constants/strings';

import { Link } from 'react-router-dom';

const Library = () => {

  return (
    <div>
     
      <main>
        <div className='main-page-wrap'>
          <h1>{APP_STRINGS.LIBRARY_TITLE}</h1>
          {/* Add your Library content here */}
          <h2>The definitive source for your lake's health & safety data</h2>
          
          <div className='collection-wrap'>

            <div className='collection-item'>
              <i className='fa-thin fa-earth-americas' aria-hidden='true'></i>
              <Link to='/library_physical'>
                <h3>Physical</h3>
              </Link>
              <p>Includes size, depth, volume, shoreline complexity, elevation, water level fluctuations, ice cover, evaporation, and sediment composition, all essential for understanding lake hydrology and structure.</p>
            </div>
            
            <div className='collection-item'>
              <i className='fa-thin fa-flask' aria-hidden='true'></i>
              <Link to='/library_chemical'>
              <h3>Chemical</h3>
              </Link>
              <p>Involves pH, dissolved oxygen, nutrient levels (nitrates, phosphates), turbidity, salinity, heavy metals, and organic pollutants, crucial for water quality, pollution detection, and aquatic life sustainability.</p>
            </div>
            
            <div className='collection-item'>
              <i className='fa-thin fa-dna' aria-hidden='true'></i>
              <Link to='/library_biological'>
              <h3>Biological</h3>
              </Link>
              <p>Covers fish populations, aquatic vegetation, plankton communities, invasive species, biodiversity, and habitat conditions, helping assess ecosystem health and species dynamics.</p>
            </div>
            
            <div className='collection-item'>
              <i className='fa-thin fa-tank-water' aria-hidden='true'></i>
              <Link to='/library_hydrological'>
              <h3>Hydrological</h3>
              </Link>
              <p>Tracks inflow/outflow rates, groundwater connections, precipitation, evaporation, and water retention time, providing insights into a lake’s water balance and movement.</p>
            </div>
            
            <div className='collection-item'>
              <i className='fa-thin fa-water' aria-hidden='true'></i>
              <Link to='/library_watershed'>
              <h3>Watershed</h3>
              </Link>
              <p>Includes land use, soil type, vegetation cover, runoff patterns, and pollution sources, helping understand how surrounding landscapes impact lake health and water quality.</p>
            </div>
                        
            <div className='collection-item'>
              <i className='fa-thin fa-umbrella-beach' aria-hidden='true'></i>
              <Link to='/library_access'>
              <h3>Access</h3>
              </Link>
              <p>Includes boat landings, marinas, beaches, swimming areas, fishing piers, and public entry points, helping assess recreational use, infrastructure, and human impact on the lake.</p>
            </div>
            
          </div> 

        </div>
      </main>
    </div>
  );
};

export default Library;
