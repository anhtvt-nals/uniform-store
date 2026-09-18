import { ArticlesService } from './articles.service';

describe('ArticlesService', () => {
  it('preserves article headings, captions, and secure link attributes', async () => {
    const content = '<h2>Heading</h2><figure><img src="/a.jpg"><figcaption>Caption</figcaption></figure><p><a href="/x" target="_blank" rel="noopener noreferrer">X</a></p>';
    const article = {
      id: 'a1',
      title: { vi: 'Bài viết' },
      content: { vi: content },
      categories: [],
      tags: [],
    };
    const service = new ArticlesService(
      { findOne: jest.fn().mockResolvedValue(article) } as never,
      {} as never,
      {} as never,
    );

    await expect(service.findBySlug('bai-viet')).resolves.toMatchObject({
      content: { vi: content },
    });
    expect(content).toContain('<h2>Heading</h2>');
    expect(content).toContain('<figcaption>Caption</figcaption>');
    expect(content).toContain('target="_blank" rel="noopener noreferrer"');
  });
});
