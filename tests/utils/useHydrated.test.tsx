import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { useHydrated } from '@utils/useHydrated';

function Probe() {
  return <span>{useHydrated() ? 'client' : 'server'}</span>;
}

describe('useHydrated', () => {
  it('is false while rendering on the server', () => {
    expect(renderToString(<Probe />)).toContain('server');
  });

  it('is true once mounted in the browser', () => {
    const { getByText } = render(<Probe />);
    expect(getByText('client')).toBeInTheDocument();
  });
});
