import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import PropTypes from 'prop-types'

Selector.propTypes = {
  text: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  disable: PropTypes.bool,
}

export default function Selector({ items = [], value, onChange, text, disable }) {
  return (
    <>
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">{text}</InputLabel>
          <Select
            disabled={disable}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={value}
            label="Age"
            onChange={onChange}
          >
            {items.map((manga) => (
              <MenuItem
                key={manga.name}
                value={manga.id}
                sx={{
                  backgroundColor: manga.color ?? 'white',
                }}
                disabled={manga.enable !== undefined ? !manga.enable : false}
              >
                {manga.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </>
  )
}
