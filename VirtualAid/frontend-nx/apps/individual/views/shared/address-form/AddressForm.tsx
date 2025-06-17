// ** React Imports
import { useContext, useEffect, useState } from 'react';

// ** Next Imports
import dynamic from 'next/dynamic';

// ** Mui Imports
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';

// ** React hook form Imports
import { Controller, UseFormReset, useForm } from 'react-hook-form';

// ** Types Imports
import { AddressFormType } from '../../../types/address';

import { useTranslation } from 'next-i18next';

const MapWithMarkerComponent = dynamic(() => import('../map/MapWithMarker'), {
  ssr: false,
});

import { LatLng, LatLngLiteral, LatLngExpression } from 'leaflet';

interface AdminAddEditFormType {
  formDefaultValues: AddressFormType;
  onSubmitClick: (
    data: AddressFormType,
    reset?: UseFormReset<AddressFormType>
  ) => void;
  onCancelClick: () => void;
  loading: boolean;
  errorMsg: string;
  showMap: boolean;
  editable: boolean;
}

const AddressForm = (props: AdminAddEditFormType) => {
  const {
    formDefaultValues,
    onSubmitClick,
    onCancelClick,
    loading,
    errorMsg,
    showMap,
    editable,
  } = props;

  const [position, setPosition] = useState<LatLngExpression | null>(null);
  const [positionError, setPositionError] = useState<boolean>(false);
  const [positionErrMsg, setPositionErrMsg] = useState('');

  const { t, ready } = useTranslation(['address', 'course', 'common']);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AddressFormType>({
    defaultValues: {
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      lat: '',
      lon: '',
    },
  });

  const locationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  useEffect(() => {
    setValue(
      'addressLine1',
      formDefaultValues.addressLine1 ? formDefaultValues.addressLine1 : ''
    );
    setValue(
      'addressLine2',
      formDefaultValues.addressLine2 ? formDefaultValues.addressLine2 : ''
    );
    setValue(
      'addressLine3',
      formDefaultValues.addressLine3 ? formDefaultValues.addressLine3 : ''
    );
    setValue('city', formDefaultValues.city ? formDefaultValues.city : '');
    setValue('state', formDefaultValues.state ? formDefaultValues.state : '');
    setValue(
      'country',
      formDefaultValues.country ? formDefaultValues.country : ''
    );
    setValue(
      'postalCode',
      formDefaultValues.postalCode ? formDefaultValues.postalCode : ''
    );
    setValue('lat', formDefaultValues.lat ? formDefaultValues.lat : '');
    setValue('lon', formDefaultValues.lon ? formDefaultValues.lon : '');
    if (formDefaultValues.lat && formDefaultValues.lat) {
      setPosition({
        lat: Number(formDefaultValues.lat),
        lng: Number(formDefaultValues.lon),
      });
    }
  }, [
    formDefaultValues.addressLine1,
    formDefaultValues.addressLine2,
    formDefaultValues.addressLine3,
    formDefaultValues.city,
    formDefaultValues.country,
    formDefaultValues.lat,
    formDefaultValues.lon,
    formDefaultValues.postalCode,
    formDefaultValues.state,
    setValue,
  ]);

  const onSubmit = (data: AddressFormType) => {
    // Note: This code is commented due to testing
    // if (showMap && !position) {
    //   setPositionError(true);
    //   setPositionErrMsg(ready ? t('grantLocationPermission') : '');
    // } else {
     onSubmitClick(data);
    // }
    // Note: This code is commented due to testing
    // if (showMap) {
    //   if (!position) {
    //     setPositionError(true);
    //     setPositionErrMsg('Please grant location permission');
    //   } else {
    //     onSubmitClick(data);
    //   }
    // } else {
    //   onSubmitClick(data);
    // }
  };

  const onLocationSuccess = (data: GeolocationPosition) => {
    setPosition({ lat: data.coords.latitude, lng: data.coords.longitude });
    setValue('lat', data.coords.latitude);
    setValue('lon', data.coords.longitude);
    setPositionError(false);
    setPositionErrMsg('');
  };

  const onLocationError = (e: GeolocationPositionError) => {
    setPositionError(true);
    setPositionErrMsg(ready ? t('grantLocationPermission') : '');
  };

  const onGiveLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.permissions.query({ name: t('course:geolocationText') }).then((result) => {
        if (result.state === t('course:grantedText')) {
          //If granted then directly call function here
          navigator.geolocation.getCurrentPosition(
            onLocationSuccess,
            onLocationError,
            locationOptions
          );
        } else if (result.state === t('course:promptText')) {
          //If prompt then the user will be asked to give permission
          navigator.geolocation.getCurrentPosition(
            onLocationSuccess,
            onLocationError,
            locationOptions
          );
        } else if (result.state === t('course:deniedText')) {
          setPositionError(true);
          setPositionErrMsg(ready ? t('grantLocationPermission') : '');
        }
      });
    }
  };

  if (!ready) {
    return <></>;
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {showMap && (
            <Grid item xs={12} md={6}>
              <Grid container>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: '200px', md: '290px' },
                      mb: '20px',
                    }}
                  >
                    <MapWithMarkerComponent position={position} />
                  </Box>
                  {positionError && (
                    <Alert severity="error" sx={{ mb: '20px' }}>
                      {positionErrMsg}
                    </Alert>
                  )}
                  <Box>
                    <Button
                      variant="gradient"
                      fullWidth
                      onClick={onGiveLocationPermission}
                      disabled={!editable}
                    >
                      {t('giveLocation')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          )}

          <Grid item xs={12} md={showMap ? 6 : 12} sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={showMap ? 12 : 6}>
                <Controller
                  control={control}
                  name="addressLine1"
                  rules={{
                    required: {
                      value: true,
                      message: ready ? t('addressLine1ReqMsg') : '',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="text"
                      label={t('addressLine1Label')}
                      required
                      disabled={!editable}
                      error={!!errors['addressLine1']}
                      helperText={
                        errors['addressLine1']
                          ? errors['addressLine1'].message
                          : ''
                      }
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={showMap ? 12 : 6}>
                <Controller
                  control={control}
                  name="addressLine2"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="text"
                      label={t('addressLine2Label')}
                      disabled={!editable}
                      error={!!errors['addressLine2']}
                      helperText={
                        errors['addressLine2']
                          ? errors['addressLine2'].message
                          : ''
                      }
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={showMap ? 12 : 6}>
                <Controller
                  control={control}
                  name="addressLine3"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="text"
                      label={t('addressLine3Label')}
                      disabled={!editable}
                      error={!!errors['addressLine3']}
                      helperText={
                        errors['addressLine3']
                          ? errors['addressLine3'].message
                          : ''
                      }
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={showMap ? 12 : 6}>
                <Controller
                  control={control}
                  name="country"
                  rules={{
                    required: {
                      value: true,
                      message: t('countryReqMsg'),
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="text"
                      label={t('countryLabel')}
                      required
                      disabled={!editable}
                      error={!!errors['country']}
                      helperText={
                        errors['country'] ? errors['country'].message : ''
                      }
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={showMap ? 12 : 6}>
                <Controller
                  control={control}
                  name="state"
                  rules={{
                    required: {
                      value: true,
                      message: t('stateReqMsg'),
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="text"
                      label={t('stateLabel')}
                      required
                      disabled={!editable}
                      error={!!errors['state']}
                      helperText={
                        errors['state'] ? errors['state'].message : ''
                      }
                     
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={showMap ? 12 : 6}>
                <Controller
                  control={control}
                  name="city"
                  rules={{
                    required: {
                      value: true,
                      message: t('cityReqMsg'),
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="text"
                      label={t('cityLabel')}
                      required
                      disabled={!editable}
                      error={!!errors['city']}
                      helperText={errors['city'] ? errors['city'].message : ''}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={showMap ? 12 : 6}>
                <Controller
                  control={control}
                  name="postalCode"
                  rules={{
                    required: {
                      value: true,
                      message: t('postalReqMsg'),
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="text"
                      label={t('postalLabel')}
                      required
                      disabled={!editable}
                      error={!!errors['postalCode']}
                      helperText={
                        errors['postalCode'] ? errors['postalCode'].message : ''
                      }
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} spacing={2}>
            <Grid container>
              <Grid item xs={12}>
                <Button variant="gradient" type="submit" disabled={loading}>
                  {loading ? (
                    <CircularProgress size="1.75rem" />
                  ) : (
                    t('common:action.add')
                  )}
                </Button>
                {onCancelClick && (
                  <Button
                    onClick={() => {
                      onCancelClick();
                    }}
                    sx={{ color: '#666666' }}
                    disabled={loading}
                  >
                    {t('common:action.cancel')}
                  </Button>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Box></Box>
      </form>
    </>
  );
};

export default AddressForm;
