import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

interface ToasterProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToasterWrapper = styled.div<{ type: string; isClosing: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  min-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: ${props => (props.isClosing ? slideOut : slideIn)} 0.3s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 9999;

  ${props => {
    switch (props.type) {
      case 'success':
        return 'background-color: #4caf50;';
      case 'error':
        return 'background-color: #f44336;';
      case 'warning':
        return 'background-color: #ff9800;';
      case 'info':
      default:
        return 'background-color: #2196f3;';
    }
  }}
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  margin-left: 16px;
  padding: 0;
  font-size: 18px;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const Toaster: React.FC<ToasterProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  useEffect(() => {
    const timer = setTimeout(handleClose, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <ToasterWrapper type={type} isClosing={isClosing}>
      <span>{message}</span>
      <CloseButton onClick={handleClose}>×</CloseButton>
    </ToasterWrapper>
  );
};

export default Toaster;
