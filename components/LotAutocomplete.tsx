import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField, Typography } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export interface AutocompleteOption {
  lotId: string;
  name: string;
  address: string;
}

export interface LotAutocompleteProps {
  onSelectionChange: (item: AutocompleteOption | null) => any
}

const MIN_UPDATE_INTERVAL = 100;

let LotAutocomplete: React.FC<LotAutocompleteProps> = props => {
  let [inputValue, setInputValue] = useState('');
  let [selectedValue, setSelectedValue] = useState<AutocompleteOption | null>(null);
  let [options, setOptions] = useState<AutocompleteOption[]>([]);

  let lastUpdate = useRef(0);

  useEffect(() => {
    if (lastUpdate.current >= Date.now() - MIN_UPDATE_INTERVAL) return;
    lastUpdate.current = Date.now();

    let active = true;
    if (inputValue === '') {
      setOptions(selectedValue ? [selectedValue] : []);
      return;
    }

    (async () => {
      let response = await axios.get('/api/v1/lots/autocomplete', {
        params: { query: inputValue }
      });
      if (!active) return;
      setOptions(response.data);
    })();

    return () => {
      active = false;
    };
  }, [inputValue]);

  return <Autocomplete
    getOptionLabel={option => option.name}
    options={options}
    autoComplete
    autoHighlight
    autoSelect
    filterOptions={(options, _state) => options}
    value={selectedValue}
    inputValue={inputValue}
    onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
    onChange={(_event, newSelection) => {
      props.onSelectionChange(newSelection);
      setSelectedValue(newSelection);
    }}
    renderInput={params => (
      <TextField {...params} label="Select a lot" variant="outlined" fullWidth />
    )}
    renderOption={option => <div>
      <Typography>{option.name}</Typography>
      <Typography variant="body2" color="textSecondary">
        {option.address}
      </Typography>
    </div>}
  />;
};

export default LotAutocomplete;
