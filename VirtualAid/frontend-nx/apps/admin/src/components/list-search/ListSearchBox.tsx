import React, { useState } from 'react';
import TextField from '@mui/material/TextField';

interface SearchBoxProps {
  onSearch: (query: string) => void; // Define the type of onSearch prop
}

const ListSearchBox: React.FC<SearchBoxProps> = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchText(query);
    onSearch(query);
  };


  return (
    <TextField
      type="text"
      placeholder="Search..."
      value={searchText}
      onChange={handleSearch}
      sx={{marginRight: '10px','& .MuiInputBase-input': { 
        padding: '8px'
      }}}
    />
  );
};

export default ListSearchBox;