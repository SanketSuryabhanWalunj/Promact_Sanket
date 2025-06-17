import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoaderProps {
  size?: number;
  color?: string;
}

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
`;

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
`;

const LoaderCircle = styled.div<LoaderProps>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background-color: ${props => props.color};
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: ${props => props.color};
    animation: ${ripple} 1.5s ease-in-out infinite;
  }

  &::after {
    animation-delay: 0.75s;
  }
`;

const Loader: React.FC<LoaderProps> = ({ size = 40, color = '#0066cc' }) => {
  return (
    <LoaderWrapper>
      <LoaderCircle size={size} color={color} />
    </LoaderWrapper>
  );
};

export default Loader;
