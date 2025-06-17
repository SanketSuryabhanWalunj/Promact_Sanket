import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const StyledBox = styled(Box)(() => ({
  background: '#fff',
  width: '100%',
  height: '120px',
  borderRadius: '15px',
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  border: '1px solid #E5E5E5',
}));

const PrimaryLine = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  fontSize: '44px',
  fontFamily: "'Outfit', sans-serif",
  marginBottom: '10px',
  lineHeight: 1,
}));

const SecondaryLine = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  fontSize: '16px',
  fontFamily: "'Outfit', sans-serif",
  lineHeight: 1,
}));

type HighLightBoxPropsType = {
  primaryLine: string;
  secondaryLine: string;
};

const HighlightBox = ({
  primaryLine,
  secondaryLine,
}: HighLightBoxPropsType) => {
  return (
    <>
      <StyledBox>
        <PrimaryLine>{primaryLine}</PrimaryLine>
        <SecondaryLine>{secondaryLine}</SecondaryLine>
      </StyledBox>
    </>
  );
};

export default HighlightBox;
