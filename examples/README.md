# Article form → Blogizi draft

An example for writers or teams who want to submit finished Markdown articles through a form and send them to Blogizi for review.

```text
Submit an article → Prepare article → Create Blogizi draft
```

The workflow uses the actual community node, `n8n-nodes-blogizi.blogizi`, with **Post → Create** and **Draft** status. It needs no AI provider or additional service credentials.

## Setup

1. Install `n8n-nodes-blogizi` in an n8n instance that permits this community package. This example targets package version **0.1.1** and uses Form Trigger **2.2**, Code **2**, and Blogizi **1**.
2. Create a workflow, open its menu, and choose **Import from File**. Select [article-form-to-draft.json](./article-form-to-draft.json).
3. Open **Create Blogizi draft**. Create or select a **Blogizi API** credential using the key from Blogizi's **Dashboard → Account → API**. Store the key in n8n credentials.
4. The node’s **Project** field uses Slug mode with `={{ $json.projectSlug }}`. Enter your Blogizi project slug in the form; it passes through **Prepare article** into the Blogizi node.
5. Save and select **Execute Workflow**. Open the **Submit an article** node's Test URL and submit the form. The trigger responds after the workflow finishes, so an API failure does not appear as a successful submission.
6. Inspect the Blogizi node's output and open the new draft in Blogizi.

The JSON imports inactive and contains no credential IDs or keys. To use the form regularly, enable the workflow using your n8n version's Publish/Activate control and use the Production URL. Configure the Form Trigger's authentication before sharing a form intended only for your team.

## Try it

| Form field | Example |
| --- | --- |
| Project slug | Your actual Blogizi project slug, for example `my-blog` |
| Title | How to automate your blog with n8n |
| Slug | Leave blank to generate `how-to-automate-your-blog-with-n8n` |
| Meta description | Submit Markdown articles through an n8n form and create Blogizi drafts for review. |
| SEO keyword | n8n blog automation |
| Article Markdown | Paste the body from [sample-article.md](./sample-article.md) |

Paste Markdown without YAML frontmatter or a repeated H1 title. Metadata has its own fields. The workflow trims surrounding whitespace, requires a project slug, title, and body, and generates a lowercase slug with hyphens. For titles using scripts that cannot produce an ASCII slug, enter a custom slug using lowercase letters, numbers, and hyphens.

## Repeated submissions and edits

Create rejects a slug that already exists in the selected project. To try another submission, change the title or supply a different slug.

For an editing workflow, duplicate this template and change the Blogizi operation to **Update**, keeping the original slug. The node's Update operation uses API upsert, so a missing slug can create a post. To keep that variation as a draft, explicitly set **Additional Fields → Status → Draft**. An update without status preserves an existing post's visibility. Blank optional metadata in this example is sent as an empty string; when updating, remove fields you want to preserve.

## Validation

The JSON structure, connections, field mappings, and preparation code were checked locally against the node source. The preparation code was exercised with sample input, custom slugs, and invalid input. The template still needs a run in your n8n instance with your Blogizi credential to verify the complete integration.

## References

- [Blogizi node package](https://www.npmjs.com/package/n8n-nodes-blogizi)
- [Blogizi public API](https://blogizi.com/docs/public-api)
- [Import workflows in n8n](https://docs.n8n.io/workflows/export-import/)
- [n8n Form Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.formtrigger/)
- [Install community nodes](https://docs.n8n.io/integrations/community-nodes/installation/gui-install/)
