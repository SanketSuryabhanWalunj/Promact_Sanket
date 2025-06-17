// ** React Imports
import { ReactNode, ChangeEvent, useState, KeyboardEvent, useEffect, useCallback } from 'react'

// ** Next Import
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Components
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import FormHelperText from '@mui/material/FormHelperText'
import Alert from '@mui/material/Alert'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import MuiLink from '@mui/material/Link'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import Cleave from 'cleave.js/react'
import { useForm, Controller } from 'react-hook-form'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

// ** Custom Styled Component
import CleaveWrapper from 'src/@core/styles/libs/react-cleave'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Styles
import 'cleave.js/dist/addons/cleave-phone.us'

// ** Hook Imports
import { useAuth } from 'src/hooks/useAuth'

// ** Config Imports
import authConfig from 'src/configs/auth'

// ** Axios Imports
import { isAxiosError } from 'axios'

// ** Axios API call imports
import { AccountVerification, ResendOtp } from 'src/api-services/AuthApi'
import { useTranslation } from 'react-i18next'

// ** Styled Components
const TwoStepsIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxHeight: 650,
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

const CleaveInput = styled(Cleave)(({ theme }) => ({
  maxWidth: 48,
  textAlign: 'center',
  height: '48px !important',
  fontSize: '150% !important',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '&:not(:last-child)': {
    marginRight: theme.spacing(2)
  },
  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
    margin: 0,
    WebkitAppearance: 'none'
  }
}))

const defaultValues: { [key: string]: string } = {
  val1: '',
  val2: '',
  val3: '',
  val4: '',
  val5: '',
  val6: ''
}
const VerifyAccountPage = () => {
  // ** State
  const [isBackspace, setIsBackspace] = useState<boolean>(false)
  const [emailAddress, setEmailAddress] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [resendOtpDisabled, setResendOtpDisabled] = useState<boolean>(false)
  const [resendOtpLoading, setResendOtpLoading] = useState<boolean>(false)
  const [otpError, setOtpError] = useState<boolean>(false)
  const [otpErrorMsg, setOtpErrorMsg] = useState<string>('')

  // ** Hooks
  const theme = useTheme()
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({ defaultValues })

  // ** Vars
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const { t, ready } = useTranslation(['individualAuth', 'common']);
  // ** Vars
  const errorsArray = Object.keys(errors)

  // ** router
  const router = useRouter()

  const auth = useAuth()

  const handleChange = (event: ChangeEvent, onChange: (...event: any[]) => void) => {
    if (!isBackspace) {
      onChange(event)

      // @ts-ignore
      const form = event.target.form
      const index = [...form].indexOf(event.target)
      if (form[index].value && form[index].value.length) {
        form.elements[index + 1].focus()
      }
      event.preventDefault()
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Backspace') {
      setIsBackspace(true)

      // @ts-ignore
      const form = event.target.form
      const index = [...form].indexOf(event.target)
      if (index >= 1) {
        if (!(form[index].value && form[index].value.length)) {
          form.elements[index - 1].focus()
        }
      }
    } else {
      setIsBackspace(false)
    }
  }

  const renderInputs = () => {
    return Object.keys(defaultValues).map((val, index) => (
      <Controller
        key={val}
        name={val}
        control={control}
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => (
          <Box
            type='tel'
            value={value}
            autoFocus={index === 0}
            component={CleaveInput}
            onKeyDown={handleKeyDown}
            onChange={(event: ChangeEvent) => handleChange(event, onChange)}
            options={{ blocks: [1], numeral: true, numeralPositiveOnly: true }}
            sx={{ [theme.breakpoints.down('sm')]: { px: `${theme.spacing(2)} !important` } }}
          />
        )}
      />
    ))
  }

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    setSubmitting(true)
    auth.login({ email: email, password: otp}, error => {
      setSubmitting(false)
      setOtpError(true)
      setOtpErrorMsg(error.errMsg)
    })
  }, [])

  useEffect(() => {
    if (router.isReady) {
      if (router.query.email && router.query.otp) {
        const email = router.query.email as string
        const otp = router.query.otp as string
        window.localStorage.setItem(process.env.NEXT_PUBLIC_ADMIN_REGISTER_EMAIL!, email)
        const splitOtp = otp.split('')
        setValue('val1', splitOtp[0])
        setValue('val2', splitOtp[1])
        setValue('val3', splitOtp[2])
        setValue('val4', splitOtp[3])
        setValue('val5', splitOtp[4])
        setValue('val6', splitOtp[5])
        verifyOtp(email, otp)
      } else {
        const ea = window.localStorage.getItem(process.env.NEXT_PUBLIC_ADMIN_REGISTER_EMAIL!)
        if (ea) {
          setEmailAddress(ea as string)
        }
      }
    }
  }, [router.isReady, router.query.email, router.query.otp, setValue, verifyOtp])

  const onSubmit = (data: { [key: string]: string }) => {
    const fullOtp = data.val1 + data.val2 + data.val3 + data.val4 + data.val5 + data.val6
    const culture = router.locale
    verifyOtp(emailAddress, fullOtp)
  }



  const onResendOTP = async () => {
    try {
      setResendOtpLoading(true)
      setResendOtpDisabled(true)
      const culture = router.locale as string
      const response = await ResendOtp(emailAddress, culture)
      if (response.status === 200) {
        setOtpError(false)
        setResendOtpLoading(false)
        setTimeout(() => {
          setResendOtpDisabled(false)
        }, 30000)
      }
    } catch (e) {
     
      setResendOtpLoading(false)
      setResendOtpDisabled(false)
      setOtpError(true)
      if (isAxiosError(e)) {
        if (e?.response?.data?.error?.code === 400 || e?.response?.data?.error?.code === '400') {
          setOtpErrorMsg(t('accountLocked'))
        } else if (e?.response?.data?.error?.code === 404 || e?.response?.data?.error?.code === '404') {
          setOtpErrorMsg(t('notFoundOtp'))
        } else if (e?.response?.data?.error?.code === 409 || e?.response?.data?.error?.code === '409') {
          setOtpErrorMsg(t('incorrectOtp'))
        }
      } else {
        setOtpErrorMsg(t('common:emailExistsError'))
      }
    }
  }

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
          <TwoStepsIllustration
            alt='two-steps-illustration'
            src={`/images/pages/auth-v2-two-steps-illustration-${theme.palette.mode}.png`}
          />
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
          {resendOtpLoading ? (
            <>
              <CircularProgress />
            </>
          ) : (
            <>
              <Box sx={{ width: '100%', maxWidth: 400 }}>
            
                <Box sx={{ width: '200px' }}>
                  {theme.palette.mode === 'light' ? (
                    <img src='/images/logos/logo@2x.png' alt='' style={{ width: '100%' }} />
                  ) : (
                    <img src='/images/logos/logo-dark.png' alt='' style={{ width: '100%' }} />
                  )}
                </Box>
                <Box sx={{ my: 6 }}>
                  <Typography variant='h3' sx={{ mb: 1.5 }}>
                    {t('twoStepVerificationText')} 💬
                  </Typography>
                  <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>
                    {t('sentCodeText')}
                  </Typography>
                  <Box display='flex' justifyContent='space-between' alignItems='center'>
                    <Typography variant='h6'>{emailAddress}</Typography>
                    <Typography
                      variant='h6'
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#666'
                      }}
                    >
                      <Icon icon='iconamoon:edit-light' />
                      <Typography component={LinkStyled} href='/login'>
                        {t('edit')}
                      </Typography>
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                 {t('enterOtp')}
                </Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <CleaveWrapper
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      ...(errorsArray.length && {
                        '& .invalid:focus': {
                          borderColor: theme => `${theme.palette.error.main} !important`,
                          boxShadow: theme => `0 1px 3px 0 ${hexToRGBA(theme.palette.error.main, 0.4)}`
                        }
                      })
                    }}
                  >
                    {renderInputs()}
                  </CleaveWrapper>
                  {errorsArray.length ? (
                    <FormHelperText sx={{ color: 'error.main', fontSize: theme => theme.typography.body2.fontSize }}>
                      {t('invalidOtp')}
                    </FormHelperText>
                  ) : null}
                  <Tooltip title={resendOtpDisabled ? t('30secText') : ''} arrow placement='right'>
                    <Typography
                      component='span'
                      variant='subtitle1'
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        mb: 4,
                        color: resendOtpDisabled ? '#999999' : '#666666',
                        cursor: resendOtpDisabled ? 'not-allowed' : 'pointer'
                      }}
                      onClick={() =>
                        resendOtpDisabled
                          ? () => {
                              //
                            }
                          : onResendOTP()
                      }
                    >
                      <Icon icon='tabler:repeat' /> &nbsp; Resend OTP
                    </Typography>
                  </Tooltip>
                  {otpError && <Alert severity='error'>{otpErrorMsg}</Alert>}
                  <Button fullWidth type='submit' variant='contained' sx={{ mt: 2 }} disabled={submitting}>
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
                      t('verifyAccountText')
                    )}
                  </Button>
                </form>
              </Box>
            </>
          )}
        </Box>
      </RightWrapper>
    </Box>
  )
}

VerifyAccountPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

VerifyAccountPage.guestGuard = true

export default VerifyAccountPage
