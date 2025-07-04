// ** React Imports
import { useState, ReactNode, MouseEvent } from 'react'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Components
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box, { BoxProps } from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'
import useBgColor from 'src/@core/hooks/useBgColor'
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

// ** Axios Imports
import { isAxiosError } from 'axios'

// ** Axios call Imports
import { LoginWithEmail } from 'src/api-services/AuthApi'
import { useTranslation } from 'react-i18next'
import LocaleDropdown from '../../../../individual/components/locale-dropdown/LocaleDropdown';
import LocaleDropdownAdmin from 'src/components/locale-dropdown/LocaleDropdown'
// ** Styled Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxHeight: 680,
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(12),
  [theme.breakpoints.down(1540)]: {
    maxHeight: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxHeight: 500
  }
}))

const RightWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 450
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 600
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: 750
  }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: `${theme.palette.primary.main} !important`
}))

const FormControlLabel = styled(MuiFormControlLabel)<FormControlLabelProps>(({ theme }) => ({
  '& .MuiFormControlLabel-label': {
    color: theme.palette.text.secondary
  }
}))

const schema = yup.object().shape({
  email: yup.string().email().required()
})

const defaultValues = {
  email: ''
}

interface FormData {
  email: string
}

const LoginPage = () => {
  const [rememberMe, setRememberMe] = useState<boolean>(true)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [submitErr, setSubmitErr] = useState<boolean>(false)
  const [submitErrMsg, setSubmitErrMsg] = useState<string>('')

  // ** Hooks
  const auth = useAuth()
  const theme = useTheme()
  const bgColors = useBgColor()
  const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  // ** Vars
  const { skin } = settings

  const {
    control,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  // router
  const router = useRouter()

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true)
      setSubmitErr(false)
      const { email } = data;
      const culture = router.locale as string;
      const response = await LoginWithEmail(email,culture)
      if (response.status === 200) {
        window.localStorage.setItem(process.env.NEXT_PUBLIC_ADMIN_REGISTER_EMAIL!, email)
        router.push('/verify-account')
      } else {
        setSubmitting(false)
        setSubmitErr(true)
        setSubmitErrMsg(t('common:error.unspecific'))
      }
    } catch (error) {
      setSubmitting(false)
      setSubmitErr(true)
      if (isAxiosError(error)) {
        if (error?.response?.data?.error?.code === 409 || error?.response?.data?.error?.code === '409') {
          setSubmitErrMsg(t('emailNotRegistered'))
        } else if (error?.response?.data?.error?.code === 403 || error?.response?.data?.error?.code === '403') {
          setSubmitErrMsg(t('accountDisabled'))
        } else if (error?.response?.status === 401) {
          setSubmitErrMsg(t('accountLocked'))
        } else {
          setSubmitErrMsg(t('common:error.unspecific'))
        }
      } else {
        setSubmitErrMsg(t('common:error.unspecific'))
      }
    }
  }

  const imageSource = skin === 'bordered' ? 'auth-v2-login-illustration-bordered' : 'auth-v2-login-illustration'

  return (
    <Box className='content-right' sx={{ backgroundColor: 'background.paper' }}>
      {!hidden ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            position: 'relative',
            alignItems: 'center',
            borderRadius: '20px',
            justifyContent: 'center',
            backgroundColor: 'customColors.bodyBg',
            margin: theme => theme.spacing(8, 0, 8, 8)
          }}
        >
          <LoginIllustration alt='login-illustration' src={`/images/pages/${imageSource}-${theme.palette.mode}.png`} />
          <FooterIllustrationsV2 />
        </Box>
      ) : null}
      <RightWrapper>
        <Box
          sx={{
            p: [6, 12],
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Box sx={{ width: '200px' }}>
              <Link href="https://virtualaid.nl/">
              {theme.palette.mode === 'light' ? (
                <img src='/images/logos/logo.png' alt='' style={{ width: '100%' }} />
              ) : (
                <img src='/images/logos/logo-dark.png' alt='' style={{ width: '100%' }} />
              )}
              </Link>
            </Box>
            <Box sx={{ width: '100%', mb: 2 }}>
            <LocaleDropdownAdmin />
          </Box>
            <Box sx={{ my: 6 }}>
              <Typography variant='h3' sx={{ mb: 1.5 }}>
              {t('welcomeText')} {`${themeConfig.templateName}! 👋🏻`}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
              {t('startLoginText')}
              </Typography>
            </Box>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ mb: 4 }}>
                <Controller
                  name='email'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <CustomTextField
                      fullWidth
                      autoFocus
                      label={t('emailLabel')}
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      placeholder={t('emailLabel')}
                      error={Boolean(errors.email)}
                      {...(errors.email && { helperText: errors.email.message })}
                    />
                  )}
                />
              </Box>
              {submitErr && (
                <Alert severity='error' sx={{ mb: 6 }}>
                  <Typography variant='body2'>{submitErrMsg}</Typography>
                </Alert>
              )}
              <Button fullWidth type='submit' variant='contained' sx={{ mb: 4 }} disabled={submitting}>
                {submitting ? (
                  <CircularProgress
                    size='15px'
                    sx={{
                      color:
                        theme.palette.mode != 'dark'
                          ? `${theme.palette.customColors.darkPaperBg} !important`
                          : `${theme.palette.customColors.lightPaperBg} !important`
                    }}
                  />
                ) : (
                  t('login')
                )}
              </Button>
              {/* Note:this is in comment because of testing */}
              {/* <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Typography sx={{ color: 'text.secondary', mr: 2 }}>New on our platform?</Typography>
                <Typography href='/register' component={LinkStyled}>
                  Create an account
                </Typography>
              </Box> */}
            </form>
          </Box>
        </Box>
      </RightWrapper>
    </Box>
  )
}

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

LoginPage.guestGuard = true

export default LoginPage
