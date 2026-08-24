ALTER TABLE discounts
    ADD COLUMN min_quantity_per_product INTEGER NOT NULL DEFAULT 1
    CHECK (min_quantity_per_product > 0);
