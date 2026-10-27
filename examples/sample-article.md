## Why automate article handoff?

Moving finished articles between tools can involve repetitive copying. A form gives writers one place to submit an article, while n8n handles the handoff to Blogizi.

## How this workflow works

1. Submit the article title and Markdown body through an n8n form.
2. n8n validates the required fields and generates a URL slug.
3. The Blogizi node creates a draft with the article and its metadata.

## Review before publishing

Open the draft in Blogizi, check the formatting, and add any images before publishing.
