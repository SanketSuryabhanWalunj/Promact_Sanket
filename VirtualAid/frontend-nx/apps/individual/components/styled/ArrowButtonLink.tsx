import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(() => ({
  color: '#fff',
  backgroundColor:
    'transparent linear-gradient(88deg, #9F1B96 0%, #27015F 100%) 0% 0% no-repeat padding-box;',
  width: '40px',
  height: '40px',
  minWidth: '40px',
  lineHeight: '53px',
  textAlign: 'center',

  padding: '0',
  transition: '0.2s ease-out',
  '&:hover': {
    backgroundColor:
      'transparent linear-gradient(88deg, #9F1B96 0%, #27015F 80%) 0% 0% no-repeat padding-box',
  },
}));

const StyledSpan = styled('span')(() => ({
  position: 'absolute',
  display: 'inline-block',
  top: '50%',
  '&:before': {
    content: `''`,
    display: 'block',
    width: '15px',
    height: '2px',
    backgroundColor: '#fff',
    top: 0,
    transition: 'width 0.5s ease-out',
  },
  '&:after': {
    content: `''`,
    display: 'block',
    width: '10px',
    height: '10px',
    borderTop: '2px solid #fff',
    borderRight: '2px solid #fff',
    transform: 'rotate(45deg)',
    top: '-4px',
    position: 'absolute',
    right: '1px',
  },
  '&:hover': {
    cursor: 'pointer',
    '&:before': {
      width: '25px',
    },
  },
}));

type ArrowButtonLinkPropsType = {
  onClick: () => void;
};

const ArrowButtonLink = (props: ArrowButtonLinkPropsType) => {
  const { onClick } = props;
  return (
    <StyledButton variant="contained" onClick={onClick}>
      <StyledSpan></StyledSpan>
    </StyledButton>
  );
};

export default ArrowButtonLink;
