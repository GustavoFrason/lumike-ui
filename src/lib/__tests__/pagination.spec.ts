import { getPageWindow } from '../pagination';

describe('getPageWindow', () => {
  it('centers the window on the current page', () => {
    expect(getPageWindow(5, 10)).toEqual({ start: 3, end: 7, pages: [3, 4, 5, 6, 7] });
  });

  it('sticks to the start and to the end', () => {
    expect(getPageWindow(1, 10).pages).toEqual([1, 2, 3, 4, 5]);
    expect(getPageWindow(10, 10).pages).toEqual([6, 7, 8, 9, 10]);
  });

  it('shows every page when there are fewer than the window size', () => {
    expect(getPageWindow(2, 3).pages).toEqual([1, 2, 3]);
  });
});
