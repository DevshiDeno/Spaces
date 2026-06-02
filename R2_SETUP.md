# Cloudflare R2 setup

This app stores venue/event images in a Cloudflare R2 bucket. The backend issues short-lived presigned URLs so the browser uploads directly to R2 (no file ever passes through the API server).

## 1. Create an R2 bucket

1. Sign in to [dash.cloudflare.com](https://dash.cloudflare.com) and create a Cloudflare account if you don't have one.
2. In the left sidebar pick **R2 Object Storage**, then **Create bucket**.
3. Name it `spaces-media` (or whatever you like — just remember the name).
4. Pick a location hint near your users (e.g. `Eastern Europe` for Africa/Europe, or `Automatic`).
5. Click **Create bucket**.

## 2. Make the bucket publicly readable

R2 buckets are private by default. We want anyone to be able to view uploaded images, so:

1. Open the bucket → **Settings** tab.
2. Under **Public access** click **Allow Access** for the R2.dev subdomain.
   - This gives you a public URL like `https://pub-<hash>.r2.dev`. Copy it — you'll need it as `R2_PUBLIC_BASE_URL`.
3. (Optional) For production, set up a custom domain (e.g. `media.qreativespaces.co.ke`) under the same Public access section.

## 3. Create an API token with R2 access

1. Still in the R2 dashboard, click **Manage R2 API Tokens** (top right).
2. **Create API token** → name it `spaces-api`.
3. Permissions: **Object Read & Write**.
4. Specify bucket: pick the bucket you just created (not "All buckets").
5. TTL: leave as default (forever) for now.
6. Click **Create API Token**.
7. Cloudflare shows you three values once — copy all three:
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`
   - **S3 API endpoint** (looks like `https://<account-id>.r2.cloudflarestorage.com`) → `R2_ENDPOINT`

## 4. CORS configuration

The browser uploads directly to R2 via a presigned PUT, so the bucket needs to allow that origin:

1. Bucket → **Settings** → **CORS Policy** → **Edit CORS policy**.
2. Paste:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://your-production-domain.com"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Replace `https://your-production-domain.com` with the deployed web app's URL (or remove the line if you don't have one yet).

## 5. Add the credentials to the API

Open `apps/api/.env` and add:

```ini
R2_ACCOUNT_ID=<account-id>
R2_ACCESS_KEY_ID=<access-key-id>
R2_SECRET_ACCESS_KEY=<secret-access-key>
R2_BUCKET=spaces-media
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_PUBLIC_BASE_URL=https://pub-<hash>.r2.dev
```

For the deployed Fly.io app, set the same vars via:

```bash
cd apps/api

... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... R2_BUCKET=spaces-media R2_ENDPOINT=... R2_PUBLIC_BASE_URL=...
```

## 6. Verify

1. Start the API locally: `cd apps/api && npm run start:dev`
2. Start the web app: `cd apps/web && npm run dev`
3. Sign in as a space owner (`owner@qreativespaces.co.ke` / `owner123`).
4. Go to **Dashboard → Spaces**, click **Manage Images** on a venue, upload an image.
5. The image should appear in the venue gallery on the public site.
