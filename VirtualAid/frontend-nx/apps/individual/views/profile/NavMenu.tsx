import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled, alpha } from '@mui/material/styles';

import { useContext, useState } from 'react';

import { DirectionContext, DirectionContextType } from '../../pages/_app';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 20,
    marginTop: theme.spacing(1),
    minWidth: 205,
    color:
      theme.palette.mode === 'light'
        ? 'rgb(55, 65, 81)'
        : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '5px 0',
      fontSize: '14px',
    },
    '.MuiButtonBase-root': {
      fontSize: '14px',
      fontWeight: 600,
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 14,
        fontWeight: 600,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

type NavMenuPropsType = {
  mobile: boolean;
};

const NavMenu = (props: NavMenuPropsType) => {
  const { currentDirection, changeCurrentDirection } =
    useContext(DirectionContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const mobile = props.mobile;
  const { t, ready } = useTranslation(['individualAuth']);
  // handle click functions for menus
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDirectionClick = () => {
    if (currentDirection === 'ltr') {
      changeCurrentDirection('rtl');
    } else {
      changeCurrentDirection('ltr');
    }
    handleClose();
  };

  return (
    <>
      <Button
        sx={
          mobile
            ? {
                display: { xs: 'block', md: 'none' },
                marginBottom: { xs: '20px', md: '0', padding: '0' },
              }
            : { display: { xs: 'none', md: 'block' } }
        }
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        dir={currentDirection}
      >
        <Typography
          sx={{
            color: '#000',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
          }}
        >
          Terry Woodson{' '}
          <svg
            style={{
              marginLeft: '-10px',
              display: 'inline-block',
              verticalAlign: 'top',
              color: '#aaa',
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="18"
            viewBox="0 0 32 32"
          >
            <path
              fill="currentColor"
              d="M8.037 11.166L14.5 22.36c.825 1.43 2.175 1.43 3 0l6.463-11.195c.826-1.43.15-2.598-1.5-2.598H9.537c-1.65 0-2.326 1.17-1.5 2.6z"
            />
          </svg>
        </Typography>
      </Button>
      {/* styled menu overrides here  */}
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        dir={currentDirection}
      >
        <MenuItem onClick={handleClose} disableRipple>
          {t('individualAuth:logout')}
        </MenuItem>
      </StyledMenu>
    </>
  );
};

export default NavMenu;
