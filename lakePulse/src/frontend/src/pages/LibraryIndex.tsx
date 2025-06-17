import React from 'react';
import { Link } from 'react-router-dom';


const LibraryIndex: React.FC = () => {
  const categories = [
    {
      title: 'Physical',
      path: '/library_physical',
      description: 'Includes size, depth, volume, shoreline complexity, elevation, water level fluctuations, ice cover, evaporation, and sediment composition',
      icon: '📏'
    },
    {
      title: 'Chemical',
      path: '/library_chemical',
      description: 'Water quality parameters such as pH, dissolved oxygen, nutrients, and contaminants',
      icon: '🧪'
    },
    {
      title: 'Biological',
      path: '/library_biological',
      description: 'Flora and fauna, including fish populations, aquatic plants, and microscopic organisms',
      icon: '🦠'
    },
    {
      title: 'Hydrological',
      path: '/library_hydrological',
      description: 'Water movement, inflows, outflows, and circulation patterns',
      icon: '💧'
    },
    {
      title: 'Watershed',
      path: '/library_watershed',
      description: 'Surrounding land area that drains into the lake',
      icon: '🗺️'
    },
    {
      title: 'Weather',
      path: '/library_weather',
      description: 'Local climate conditions and atmospheric influences',
      icon: '🌤️'
    },
    {
      title: 'Access',
      path: '/library_access',
      description: 'Lake accessibility, public access points, and facilities',
      icon: '🚪'
    }
  ];

  return (
    <div className="library-index-container">
      <h1>Data Library</h1>
      <div className="category-grid">
        {categories.map((category) => (
          <Link 
            to={category.path} 
            key={category.path}
            className="category-card"
          >
            <div className="category-icon">{category.icon}</div>
            <h3>{category.title}</h3>
            <p>{category.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LibraryIndex; 