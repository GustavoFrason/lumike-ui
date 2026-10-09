import { imagesService } from '../images.service';
import { api } from '../../api';
import { compressImage } from '../../utils/image-compression';

jest.mock('../../api', () => ({
  api: { post: jest.fn(), get: jest.fn(), delete: jest.fn() },
}));

jest.mock('../../utils/image-compression', () => ({
  compressImage: jest.fn(),
}));

const mockedPost = api.post as jest.Mock;
const mockedCompress = compressImage as jest.MockedFunction<typeof compressImage>;

const fileOfSize = (bytes: number, name = 'foto.jpg') =>
  new File([new Uint8Array(bytes)], name, { type: 'image/jpeg' });

describe('imagesService uploads (via API, sem Supabase no front)', () => {
  beforeEach(() => {
    mockedPost.mockReset();
    mockedPost.mockResolvedValue({ data: { url: 'https://cdn/x.jpg', path: 'x.jpg' } });
    mockedCompress.mockReset();
    mockedCompress.mockImplementation(async (f) => f);
  });

  const sentForm = () => mockedPost.mock.calls[0][1] as FormData;

  it('uploadImage compresses and posts multipart with the product id as folder', async () => {
    const original = fileOfSize(1000);

    const url = await imagesService.uploadImage(42, original);

    expect(url).toBe('https://cdn/x.jpg');
    expect(mockedCompress).toHaveBeenCalledWith(original);
    expect(mockedPost).toHaveBeenCalledWith('/uploads/images', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(sentForm().get('folder')).toBe('42');
    expect(sentForm().get('file')).toBeInstanceOf(File);
  });

  it('uploadCategoryImage uses the "categorias" folder', async () => {
    await imagesService.uploadCategoryImage(fileOfSize(10));
    expect(sentForm().get('folder')).toBe('categorias');
  });

  it('uploadBannerImage uses the "banners" folder', async () => {
    await imagesService.uploadBannerImage(fileOfSize(10));
    expect(sentForm().get('folder')).toBe('banners');
  });

  it('refuses files still above 4MB after compression (Vercel body limit)', async () => {
    await expect(imagesService.uploadImage(1, fileOfSize(4 * 1024 * 1024 + 1))).rejects.toThrow(
      /4MB/,
    );
    expect(mockedPost).not.toHaveBeenCalled();
  });
});
