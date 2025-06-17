import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import ArrowButtonLink from '../../../components/styled/ArrowButtonLink';

import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import { useContext } from 'react';

const OuterBox = styled(Box)(() => ({
  width: '100%',
  marginBottom: '20px',
  position: 'relative',
  background:
    'linear-gradient(180deg, rgba(241,241,241,1) 0%, rgba(255,255,255,1) 100%)',
  borderRadius: '20px',
  height: '120px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 30px 0 50px',
  border: '1px solid #EEEEEE',
  '&:before': {
    position: 'absolute',
    content: `''`,
    left: '0',
    width: '30px',
    height: '100%',
    background:
      'linear-gradient(180deg, rgba(159,27,150,1) 0%, rgba(39,1,95,1) 100%)',
    borderTopLeftRadius: '20px',
    borderBottomLeftRadius: '20px',
  },
}));

const PrimaryText = styled(Typography)(({theme}) => ({
  fontSize: '18px',
  color: '#000',
  fontFamily: "'Outfit', sans-serif",
  display: "-webkit-box",
  webkitBoxOrient:"vertical",
  webkitLineClamp: "3",
  overflow: "hidden",
 
}));

const SecondaryText = styled(Typography)(({theme}) => ({
  fontSize: '16px',
  color: '#666666',
  fontFamily: "'Open Sans', sans-serif",
  display: "-webkit-box",
  webkitBoxOrient:"vertical",
  webkitLineClamp: "3",
  overflow: "hidden",

  
}));

type InfoBoxWithLinkPropsType = {
  primaryText?: string;
  secondaryText?: string;
  link?: string;
};

const InfoBoxWithLink = (props: InfoBoxWithLinkPropsType) => {
  const { primaryText, secondaryText, link } = props;

  const router = useRouter();

  const onButtonClick = () => {
    if (link) {
      router.push(link);
    }
  };

  return (
    <>
      <OuterBox>
        <Box>
          {primaryText && <PrimaryText className='line-clamp-text' title={primaryText}>{primaryText}</PrimaryText>}
          {secondaryText && <SecondaryText className='line-clamp-text' title={secondaryText}>{secondaryText}</SecondaryText>}
        </Box>
        <Box>{link && <ArrowButtonLink onClick={onButtonClick} />}</Box>
      </OuterBox>
    </>
  );
};

export default InfoBoxWithLink;
