import {
	NodeOperationError,
	type IDataObject,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
} from 'n8n-workflow';

const ALLOWED_MIME_TYPES = new Set([
	'image/png',
	'image/jpeg',
	'image/jpg',
	'image/webp',
	'image/svg+xml',
]);

const COVER_MAX_BYTES = 2 * 1024 * 1024;
const CONTENT_MAX_BYTES = 5 * 1024 * 1024;

type MultipartFile = {
	buffer: Buffer;
	filename: string;
	contentType: string;
};

function encodeMultipart(fields: Record<string, string>, file: MultipartFile): {
	body: Buffer;
	contentType: string;
} {
	const boundary = `----BlogiziForm${Date.now().toString(16)}`;
	const chunks: Buffer[] = [];
	const push = (value: string) => chunks.push(Buffer.from(value));

	for (const [name, value] of Object.entries(fields)) {
		push(`--${boundary}\r\n`);
		push(`Content-Disposition: form-data; name="${name}"\r\n\r\n`);
		push(`${value}\r\n`);
	}

	const filename = file.filename.replace(/["\r\n]/g, '');
	push(`--${boundary}\r\n`);
	push(`Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`);
	push(`Content-Type: ${file.contentType}\r\n\r\n`);
	chunks.push(file.buffer);
	push(`\r\n--${boundary}--\r\n`);

	return {
		body: Buffer.concat(chunks),
		contentType: `multipart/form-data; boundary=${boundary}`,
	};
}

export async function prepareImageUpload(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const binaryPropertyName = this.getNodeParameter('binaryPropertyName') as string;
	const imageType = this.getNodeParameter('imageType') as string;
	const postIdentifierType = this.getNodeParameter('postIdentifierType') as string;
	const postIdentifier = this.getNodeParameter('postIdentifier') as string;
	const projectSlug = this.getNodeParameter('projectSlug', '', { extractValue: true }) as
		| string
		| IDataObject;
	const slug = typeof projectSlug === 'string' ? projectSlug : String(projectSlug.value ?? '');
	const binaryData = this.helpers.assertBinaryData(binaryPropertyName);
	const buffer = await this.helpers.getBinaryDataBuffer(binaryPropertyName);
	const mimeType = binaryData.mimeType || 'application/octet-stream';

	if (!ALLOWED_MIME_TYPES.has(mimeType)) {
		throw new NodeOperationError(
			this.getNode(),
			`Blogizi accepts PNG, JPG, WebP, or SVG images. Received ${mimeType}.`,
		);
	}

	const maxBytes = imageType === 'cover' ? COVER_MAX_BYTES : CONTENT_MAX_BYTES;
	if (buffer.length > maxBytes) {
		const limitLabel = imageType === 'cover' ? '2 MB' : '5 MB';
		throw new NodeOperationError(
			this.getNode(),
			`${imageType === 'cover' ? 'Cover' : 'Content'} images must be ${limitLabel} or smaller.`,
		);
	}

	const fields: Record<string, string> = {
		type: imageType,
		[postIdentifierType === 'id' ? 'postId' : 'postSlug']: postIdentifier,
	};
	if (slug) fields.projectSlug = slug;

	const encoded = encodeMultipart(fields, {
		buffer,
		filename: binaryData.fileName || 'upload',
		contentType: mimeType,
	});

	const headers: IDataObject = { ...(requestOptions.headers ?? {}) };
	delete headers['Content-Type'];
	delete headers['content-type'];
	headers['Content-Type'] = encoded.contentType;
	if (slug) headers['X-Blogizi-Project'] = slug;

	return {
		...requestOptions,
		headers,
		body: encoded.body,
		json: false,
	};
}
