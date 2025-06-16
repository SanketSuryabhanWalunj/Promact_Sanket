import styled from 'styled-components';
import waveIcon from '../assets/wave-icon.svg';



const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
`;

const WaveImage = styled.img`
  width: 60px;
  height: 60px;
`;

const PulseLoader = () => {
  return (
    <LoaderContainer>
      <WaveImage src={waveIcon} alt="Loading" />
    </LoaderContainer>
  );
};

export default PulseLoader;
