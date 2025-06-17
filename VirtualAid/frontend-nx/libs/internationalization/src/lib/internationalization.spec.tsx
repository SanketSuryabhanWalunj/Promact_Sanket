import { render } from '@testing-library/react';

import Internationalization from './internationalization';

describe('Internationalization', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Internationalization />);
    expect(baseElement).toBeTruthy();
  });
});
