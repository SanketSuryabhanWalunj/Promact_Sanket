import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { APP_STRINGS } from '../constants/strings';


const Community = () => {

  return (
    <div>
      <main>
        <div>
          <h1>{APP_STRINGS.NAV_COMMUNITY}</h1>
          <h2 className='comingsoon'>Coming soon!</h2>
        </div>
      </main>
    </div>
  );
};

export default Community;
