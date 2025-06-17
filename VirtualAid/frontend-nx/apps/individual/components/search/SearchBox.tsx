import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import SearchIcon from '@mui/icons-material/Search';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SearchBox = () => {
  const [expanded, setExpanded] = useState(false);
  const { t, ready } = useTranslation(['common']);
  const handleSearchClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div
      style={{
        width: expanded ? '100%' : '50px',
        height: '50px',
        borderRadius: expanded ? '10px' : '50%',
        transition: 'width 0.3s, border-radius 0.3s',
        overflow: 'hidden',
        border: expanded ? 'none' : '1px solid #ddd',
        background: expanded ? '#f7f7f7' : 'none',
        display: 'flex',
        alignItems: 'center',
        margin: '20px 0',
      }}
    >
      <InputBase
         placeholder={t('searchText')}
        // style={{ width: expanded ? '100%' : '0' }}
        fullWidth
        startAdornment={
          <InputAdornment position="start">
            <IconButton
              aria-label="search"
              onClick={handleSearchClick}
              size="large"
              sx={{ color: '#000' }}
            >
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        }
      />
    </div>
  );
};

export default SearchBox;
