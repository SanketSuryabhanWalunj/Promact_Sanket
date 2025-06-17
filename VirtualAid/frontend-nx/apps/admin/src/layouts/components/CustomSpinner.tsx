// ** MUI Imports
import Box, { BoxProps } from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme } from '@mui/material/styles'

const FallbackSpinner = ({ sx }: { sx?: BoxProps['sx'] }) => {
  // ** Hook
  const theme = useTheme()

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        ...sx
      }}
    >
      {theme.palette.mode === 'dark' ? (
        <>
          <img src='/images/logos/logo-dark.png' alt='' />
          <CircularProgress disableShrink sx={{ mt: 6, color: '#fff !important' }} />
        </>
      ) : (
        <>
          <img src='/images/logos/logo@2x.png' alt='' />
          <CircularProgress disableShrink sx={{ mt: 6 }} />
        </>
      )}
    </Box>
  )
}

export default FallbackSpinner
