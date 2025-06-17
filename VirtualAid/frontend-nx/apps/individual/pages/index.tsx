/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { InfoContext } from '../contexts/InfoContext';
import FullPageSpinner from '../components/spinner/FullPageSpinner';

export function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.css file.
   */

  const { isCompany } = useContext(InfoContext);

  const router = useRouter();

  if (isCompany) {
    router.replace('/company/dashboard');
  } else {
    router.replace('/user/dashboard');
  }
 
  return (
    <>
      <Container maxWidth="xl">
        <FullPageSpinner />
      </Container>
    </>
  );
}

Index.authGuard = true;

export default Index;
