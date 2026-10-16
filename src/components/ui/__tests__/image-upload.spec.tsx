import React from 'react';
import { render, screen, fireEvent, act, createEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImageUpload } from '../image-upload';
import { notify } from '../notify';

jest.mock('../notify', () => ({ notify: { error: jest.fn(), success: jest.fn() } }));

const image = (name = 'anel.jpg') => new File(['img'], name, { type: 'image/jpeg' });
const pdf = () => new File(['pdf'], 'nota.pdf', { type: 'application/pdf' });

/** Evento de arrastar com arquivos, como o navegador manda. */
const fileDrag = (files: File[]) => ({ dataTransfer: { files, types: ['Files'] } });

function setup(props: Partial<React.ComponentProps<typeof ImageUpload>> = {}) {
  const onUpload = jest.fn().mockResolvedValue(undefined);
  const { container } = render(<ImageUpload onUpload={onUpload} {...props} />);
  return { onUpload, zone: container.firstChild as HTMLElement };
}

beforeAll(() => {
  // jsdom não implementa URL.createObjectURL.
  URL.createObjectURL = jest.fn(() => 'blob:preview');
});

beforeEach(() => jest.clearAllMocks());

describe('ImageUpload: arrastar e soltar', () => {
  it('uploads every dropped image', async () => {
    const { onUpload, zone } = setup();

    await act(async () => {
      fireEvent.drop(zone, fileDrag([image('a.jpg'), image('b.jpg')]));
    });

    expect(onUpload).toHaveBeenCalledTimes(2);
    expect(onUpload.mock.calls.map(([f]) => f.name)).toEqual(['a.jpg', 'b.jpg']);
    expect(screen.getAllByAltText(/Preview/)).toHaveLength(2);
  });

  it('ignores files that are not images and says so', async () => {
    const { onUpload, zone } = setup();

    await act(async () => {
      fireEvent.drop(zone, fileDrag([image(), pdf()]));
    });

    expect(onUpload).toHaveBeenCalledTimes(1);
    expect(notify.error).toHaveBeenCalledWith('1 arquivo(s) ignorado(s): não são imagens.');
  });

  it('refuses a drop with no image at all', async () => {
    const { onUpload, zone } = setup();

    await act(async () => {
      fireEvent.drop(zone, fileDrag([pdf()]));
    });

    expect(onUpload).not.toHaveBeenCalled();
    expect(notify.error).toHaveBeenCalledWith('Só dá para adicionar imagens (JPG, PNG, WEBP...).');
  });

  it('highlights the field while dragging and clears it on leave', () => {
    const { zone } = setup();

    fireEvent.dragEnter(zone, fileDrag([image()]));
    expect(screen.getByText('Solte as imagens aqui')).toBeInTheDocument();

    fireEvent.dragLeave(zone, fileDrag([image()]));
    expect(screen.queryByText('Solte as imagens aqui')).not.toBeInTheDocument();
  });

  it('keeps the limit of images', async () => {
    const { onUpload, zone } = setup({ maxImages: 1 });

    await act(async () => {
      fireEvent.drop(zone, fileDrag([image('a.jpg'), image('b.jpg')]));
    });

    expect(onUpload).not.toHaveBeenCalled();
    expect(notify.error).toHaveBeenCalledWith('Você pode adicionar no máximo 1 imagens');
  });

  it('does nothing when disabled', async () => {
    const { onUpload, zone } = setup({ disabled: true });

    fireEvent.dragEnter(zone, fileDrag([image()]));
    expect(screen.queryByText('Solte as imagens aqui')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.drop(zone, fileDrag([image()]));
    });
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('still works by clicking and choosing the files', async () => {
    const { onUpload, zone } = setup();
    const input = zone.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [image()] } });
    });

    expect(onUpload).toHaveBeenCalledTimes(1);
  });

  it('keeps the browser from opening a file dropped outside the field', () => {
    setup();

    const drop = createEvent.drop(window, fileDrag([image()]));
    fireEvent(window, drop);

    expect(drop.defaultPrevented).toBe(true);
  });
});
