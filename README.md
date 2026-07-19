# uniform-store

A full-stack e-commerce application built with [Vendure](https://www.vendure.io/) and [Next.js](https://nextjs.org/).

## Project Structure

This is a monorepo using npm workspaces:

```
uniform-store/
├── apps/
│   ├── server/       # Vendure backend (GraphQL API, Admin Dashboard, S3 asset storage)
│   └── storefront/   # Next.js storefront (Minh An Uniform / aura-fashion UI)
└── package.json      # Root workspace configuration
```

## Getting Started

### Development

Start both the server and storefront in development mode:

```bash
npm run dev
```

Or run them individually:

```bash
# Start only the server
npm run dev:server

# Start only the storefront
npm run dev:storefront
```

### Access Points

- **Vendure Dashboard**: http://localhost:3000/dashboard
- **Shop GraphQL API**: http://localhost:3000/shop-api
- **Admin GraphQL API**: http://localhost:3000/admin-api
- **Storefront**: http://localhost:3001

### Admin Credentials

Use these credentials to log in to the Vendure Dashboard:

- **Username**: superadmin
- **Password**: superadmin

## S3 Asset Storage (server)

By default assets are stored on local disk. To use Amazon S3 (or S3-compatible
services like MinIO / Cloudflare R2 / Backblaze B2), set in `apps/server/.env`:

```env
ASSET_STORAGE=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET=vendure-assets
# Optional for S3-compatible: S3_ENDPOINT=http://localhost:9000
# Optional CDN prefix:   S3_PUBLIC_URL_PREFIX=https://bucket.s3.amazonaws.com/assets
```

See `apps/server/README.md` for details.

## Production Build

Build all packages:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## Learn More

- [Vendure Documentation](https://docs.vendure.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vendure Discord Community](https://vendure.io/community)
