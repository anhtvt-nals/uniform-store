CREATE TABLE product_article_map (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, article_id)
);

CREATE INDEX idx_product_article_map_article_id ON product_article_map(article_id);
