# n8n-nodes-blogizi

Create, update, and publish posts on [Blogizi](https://blogizi.com) from n8n. The node talks to the [public API](https://blogizi.com/docs/public-api).

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

**Post** (account API key)

- Create a post (`POST /api/posts`)
- Update a post by slug (`POST /api/posts` with `upsert: true`)
- Get many posts for a project (`GET /api/projects/{projectId}/posts`)
- Upload a cover or content image for an existing post (`POST /api/upload`)

**Project** (account API key)

- Get many projects (`GET /api/account/projects`)

**Search Console** (account API key)

- Get cached Google Search Console performance (`GET /api/search-analytics`)

**Site** (no API key)

- List published posts (`GET /api/sites/{projectSlug}/posts`)
- Search a blog (`GET /api/sites/{projectSlug}/search`)
- Resolve a custom domain (`GET /api/resolve-domain`)

Dashboard-only routes, including post delete and API key regeneration, are not included. The public pageview beacon is also omitted, because each call counts toward the account's monthly pageview quota.

## Credentials

1. Open [Blogizi](https://blogizi.com) and go to **Dashboard → Account → API**.
2. Copy the account API key.
3. In n8n, create a **Blogizi API** credential and paste the key.

One key covers every project on the account. If the account has more than one blog, choose the project on the node. With a single project, Blogizi selects it when the project field is left empty.

The credential test calls `GET /api/account/projects`.

## Compatibility

n8n 1.x or later. Build and lint this package with Node.js 22 or 24. Node.js 25 currently fails to compile a native module used by the n8n node tooling.

## Usage

Create a draft first, then upload images. A content upload returns markdown you can place in the post body and send again with **Update**. A cover upload is saved on the post immediately.

Publishing sets status to **Published**, which goes live immediately and cancels any schedule. To publish later, create or update with a future **Scheduled At** time and leave the status as draft.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/installation/)
- [Blogizi public API](https://blogizi.com/docs/public-api)
- [Blogizi API authentication](https://blogizi.com/docs/api-authentication)
