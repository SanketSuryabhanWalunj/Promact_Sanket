// ** React Imports
import React, { useState, useEffect, useMemo, MouseEvent } from 'react'
// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import LinearProgress from '@mui/material/LinearProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import DialogContentText from '@mui/material/DialogContentText'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Types
import { IndividualProfileType } from 'src/types/individual'
import axios from 'axios'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import { useRouter } from 'next/router'

interface IndividualViewLeftProps {
  individualDetails: IndividualProfileType
}

const IndividualViewLeft = (props: IndividualViewLeftProps) => {
  const { individualDetails } = props
  const router = useRouter()
  const { id } = router.query
  const [isEmployeesLoading, setIsEmployeeLoading] = useState(false)
  const [employees, setEmployees] = useState<IndividualProfileType[]>([])
  const [isEmployeesError, setIsEmployeesError] = useState(false)
  const [employeesErrorMsg, setEmployeesErrorMsg] = useState('')
  const getAllEmployees = async () => {
    try {
      setIsEmployeeLoading(true)
      const response = await axios.get(`https://localhost:44373/api/app/admin/individual-profile?{id}`,
      {
        headers: {
          'Accept-Language': router.locale, // Set content type for FormData
        },
      });

      if (response.status === 200) {
        setEmployees(response.data)
        
        setIsEmployeeLoading(false)
        setIsEmployeesError(false)
        setEmployeesErrorMsg('')
      }

     
    } catch (error) {
      setIsEmployeeLoading(true)
      setIsEmployeesError(true)
      setEmployeesErrorMsg('Something went wrong')
    }
  }
  useEffect(() => {
    getAllEmployees()
  })

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent sx={{ pt: 13.5, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            {individualDetails.profileImage ? (
              <CustomAvatar
                src={individualDetails.profileImage}
                variant='rounded'
                alt={individualDetails.fullName}
                sx={{ width: 100, height: 100, mb: 4 }}
              />
            ) : (
              <CustomAvatar skin='light' variant='rounded' sx={{ width: 100, height: 100, mb: 4, fontSize: '3rem' }}>
                {getInitials(individualDetails.fullName)}
              </CustomAvatar>
            )}
            <Typography variant='h4' sx={{ mb: 3 }}>
              {individualDetails.fullName}
            </Typography>
            <CustomChip
              rounded
              skin='light'
              size='small'
              label={individualDetails.country}
              color={'secondary'}
              sx={{ textTransform: 'capitalize' }}
            />
          </CardContent>

          <CardContent sx={{ pt: theme => `${theme.spacing(2)} !important` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ mr: 8, display: 'flex', alignItems: 'center' }}>
                <CustomAvatar skin='light' variant='rounded' sx={{ mr: 2.5, width: 38, height: 38 }}>
                  <Icon fontSize='1.75rem' icon='tabler:checkbox' />
                </CustomAvatar>
                <div>
                  <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>1.23k</Typography>
                  <Typography variant='body2'>Employees Enrolled</Typography>
                </div>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CustomAvatar skin='light' variant='rounded' sx={{ mr: 2.5, width: 38, height: 38 }}>
                  <Icon fontSize='1.75rem' icon='tabler:briefcase' />
                </CustomAvatar>
                <div>
                  <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>568</Typography>
                  <Typography variant='body2'>Course Purchased</Typography>
                </div>
              </Box>
            </Box>
          </CardContent>

          <Divider sx={{ my: '0 !important', mx: 6 }} />

          <CardContent sx={{ pb: 4 }}>
            <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>
              Details
            </Typography>
            <Box sx={{ pt: 4 }}>
              <Box sx={{ display: 'flex', mb: 3 }}>
                <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>Username:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>@{}</Typography>
              </Box>
              <Box sx={{ display: 'flex', mb: 3 }}>
                <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>Email:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{individualDetails.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', mb: 3, alignItems: 'center' }}>
                <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>Status:</Typography>
                <CustomChip
                  rounded
                  skin='light'
                  size='small'
                  label={'Active'}
                  color={'success'}
                  sx={{
                    textTransform: 'capitalize'
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', mb: 3 }}>
                <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>Contact:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{individualDetails.contactNumber}</Typography>
              </Box>
              <Box sx={{ display: 'flex' }}>
                <Typography sx={{ mr: 2, fontWeight: 500, color: 'text.secondary' }}>Address:</Typography>
                <Box>
                  <Typography sx={{ color: 'text.secondary' }}>{individualDetails.country}</Typography>
                </Box>
                
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default IndividualViewLeft
