// ** React Imports
import { useState, SyntheticEvent, Fragment, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Auth config
import authConfig from 'src/configs/auth'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Context
import { useAuth } from 'src/hooks/useAuth'

// ** Type Imports
import { Settings } from 'src/@core/context/settingsContext'
import { IndividualDetailsType } from 'src/types/individual'

import { getInitials } from 'src/@core/utils/get-initials'

interface Props {
  settings: Settings
}

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const MenuItemStyled = styled(MenuItem)<MenuItemProps>(({ theme }) => ({
  '&:hover .MuiBox-root, &:hover .MuiBox-root svg': {
    color: theme.palette.primary.main
  }
}))

type DropdownUserType = IndividualDetailsType & {
  role: string
}

const CustomUserDropdown = (props: Props) => {
  // ** Props
  const { settings } = props

  // ** States
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)
  const [userDetails, setUserDetails] = useState<DropdownUserType>({} as DropdownUserType)

  // ** Hooks
  const router = useRouter()
  const { logout } = useAuth()

  // ** Vars
  const { direction } = settings

  useEffect(() => {
    const userDataFromLocalStorage = window.localStorage.getItem(authConfig.storageUserDataKeyName)
    if (userDataFromLocalStorage) {
      const parsedData = JSON.parse(userDataFromLocalStorage)
      setUserDetails(parsedData)
    }
  }, [])

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = (url?: string) => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }

  const styles = {
    px: 4,
    py: 1.75,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      mr: 2.5,
      fontSize: '1.5rem',
      color: 'text.secondary'
    }
  }

  const handleLogout = () => {
    logout()
    handleDropdownClose()
  }

  return (
    <Fragment>
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        {userDetails?.profileImage ? (
          <>
            <Avatar
              alt={userDetails?.firstName + ' ' + userDetails?.lastName}
              src={userDetails?.profileImage}
              onClick={handleDropdownOpen}
              sx={{ width: 38, height: 38 }}
            />
          </>
        ) : (
          <>
            <CustomAvatar
              skin='filled'
              sx={{
                width: 38,
                height: 38,
                fontWeight: 500,
                fontSize: theme => theme.typography.body1.fontSize
              }}
              onClick={handleDropdownOpen}
            >
              {getInitials(
                userDetails?.firstName && userDetails?.lastName
                  ? `${userDetails?.firstName} ${userDetails?.lastName}`
                  : ''
              )}
            </CustomAvatar>
          </>
        )}
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, mt: 4.75 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
      >
        <Box sx={{ py: 1.75, px: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* <Badge
              overlap='circular'
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
            > */}
            {userDetails?.profileImage ? (
              <Avatar alt='John Doe' src='/images/avatars/1.png' sx={{ width: '2.5rem', height: '2.5rem' }} />
            ) : (
              <CustomAvatar
                skin='filled'
                sx={{
                  width: '2.5rem',
                  height: '2.5rem',
                  fontWeight: 500,
                  fontSize: theme => theme.typography.body1.fontSize
                }}
                onClick={handleDropdownOpen}
              >
                {getInitials(
                  userDetails?.firstName && userDetails?.lastName
                    ? `${userDetails?.firstName} ${userDetails?.lastName}`
                    : ''
                )}
              </CustomAvatar>
            )}
            {/* </Badge> */}
            <Box sx={{ display: 'flex', ml: 2.5, alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography sx={{ fontWeight: 500 }}>
                {userDetails?.firstName && userDetails?.lastName
                  ? `${userDetails?.firstName} ${userDetails?.lastName}`
                  : ''}
              </Typography>
              <Typography variant='body2'>{userDetails?.role}</Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
        {/*         
        <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='tabler:user-check' />
            My Profile
          </Box>
        </MenuItemStyled>
         */}
        {/* 
        <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='tabler:settings' />
            Settings
          </Box>
        </MenuItemStyled>
         */}
        {/* 
        <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='tabler:credit-card' />
            Billing
          </Box>
        </MenuItemStyled>
         */}
        {/*          
        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
         */}
        {/* 
        <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='tabler:lifebuoy' />
            Help
          </Box>
        </MenuItemStyled>
         */}
        {/* 
        <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='tabler:info-circle' />
            FAQ
          </Box>
        </MenuItemStyled>
         */}
        {/* 
        <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='tabler:currency-dollar' />
            Pricing
          </Box>
        </MenuItemStyled>
         */}
        {/* 
        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
         */}
        <MenuItemStyled sx={{ p: 0 }} onClick={handleLogout}>
          <Box sx={styles}>
            <Icon icon='tabler:logout' />
            Sign Out
          </Box>
        </MenuItemStyled>
      </Menu>
    </Fragment>
  )
}

export default CustomUserDropdown
