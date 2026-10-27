import type { IDataObject, IExecuteSingleFunctions, IHttpRequestOptions, INodeProperties } from 'n8n-workflow';

import { prepareImageUpload } from '../../shared/multipart';
import { limitResultFields, postAdditionalFields, projectIdField, projectSlugField } from '../../shared/fields';

const showOnlyForPosts = {
	resource: ['post'],
};

const showForWrite = {
	resource: ['post'],
	operation: ['create', 'update'],
};

async function applySchedule(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const scheduleMode = this.getNodeParameter('scheduleMode') as string;
	if (scheduleMode !== 'clear') return requestOptions;

	const body = (requestOptions.body ?? {}) as IDataObject;
	body.scheduledAt = null;
	requestOptions.body = body;
	return requestOptions;
}

export const postDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForPosts },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a post',
				description: 'Create a draft or published post',
				routing: {
					request: {
						method: 'POST',
						url: '/api/posts',
					},
					send: {
						type: 'body',
						property: 'upsert',
						value: '={{false}}',
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a post',
				description: 'Update an existing post with the same slug',
				routing: {
					request: {
						method: 'POST',
						url: '/api/posts',
					},
					send: {
						type: 'body',
						property: 'upsert',
						value: '={{true}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many posts',
				description: 'List posts for a project, newest first',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/projects/{{$parameter.projectId}}/posts',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Upload Image',
				value: 'upload',
				action: 'Upload a post image',
				description: 'Upload a cover or inline content image for an existing post',
				routing: {
					request: {
						method: 'POST',
						url: '/api/upload',
					},
					send: {
						preSend: [prepareImageUpload],
					},
				},
			},
		],
		default: 'create',
	},
	projectSlugField({
		show: {
			resource: ['post'],
			operation: ['create', 'update', 'upload'],
		},
	}),
	projectIdField({
		show: {
			resource: ['post'],
			operation: ['getAll'],
		},
	}),
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showForWrite },
		routing: { send: { type: 'body', property: 'title' } },
	},
	{
		displayName: 'Slug',
		name: 'slug',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'how-we-built-our-auth-flow',
		description: 'URL slug. Update finds the existing post by this slug.',
		displayOptions: { show: showForWrite },
		routing: { send: { type: 'body', property: 'slug' } },
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{ name: 'Draft', value: 'draft' },
			{ name: 'Published', value: 'published' },
		],
		default: 'draft',
		description: 'Published goes live immediately and cancels any schedule',
		displayOptions: { show: { resource: ['post'], operation: ['create'] } },
		routing: { send: { type: 'body', property: 'status' } },
	},
	{
		displayName: 'Schedule',
		name: 'scheduleMode',
		type: 'options',
		options: [
			{ name: 'Leave Unchanged', value: 'unchanged' },
			{ name: 'Set Time', value: 'set' },
			{ name: 'Clear', value: 'clear' },
		],
		default: 'unchanged',
		description: 'Whether to set, clear, or keep the scheduled publish time',
		displayOptions: { show: { resource: ['post'], operation: ['update'] } },
		routing: {
			send: {
				preSend: [applySchedule],
			},
		},
	},
	{
		displayName: 'Scheduled At',
		name: 'scheduledAt',
		type: 'dateTime',
		default: '',
		required: true,
		description:
			'Future time keeps the post as a draft until then. A value without a timezone uses the project timezone.',
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['update'],
				scheduleMode: ['set'],
			},
		},
		routing: { send: { type: 'body', property: 'scheduledAt' } },
	},
	postAdditionalFields({ show: { resource: ['post'], operation: ['create'] } }, 'create'),
	postAdditionalFields({ show: { resource: ['post'], operation: ['update'] } }, 'update'),
	...limitResultFields({
		show: {
			resource: ['post'],
			operation: ['getAll'],
		},
	}),
	{
		displayName: 'The post must already exist. Create a draft first, then upload a cover or content image.',
		name: 'uploadNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['post'], operation: ['upload'] } },
	},
	{
		displayName: 'Image Type',
		name: 'imageType',
		type: 'options',
		options: [
			{
				name: 'Cover',
				value: 'cover',
				description: 'Hero image, 2 MB max. Saved onto the post immediately.',
			},
			{
				name: 'Content',
				value: 'content',
				description: 'Inline image, 5 MB max. Response includes markdown to paste into the post.',
			},
		],
		default: 'content',
		displayOptions: { show: { resource: ['post'], operation: ['upload'] } },
	},
	{
		displayName: 'Post Identifier',
		name: 'postIdentifierType',
		type: 'options',
		options: [
			{ name: 'Slug', value: 'slug' },
			{ name: 'ID', value: 'id' },
		],
		default: 'slug',
		displayOptions: { show: { resource: ['post'], operation: ['upload'] } },
	},
	{
		displayName: 'Post Slug or ID',
		name: 'postIdentifier',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['post'], operation: ['upload'] } },
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property that holds the PNG, JPG, WebP, or SVG file',
		displayOptions: { show: { resource: ['post'], operation: ['upload'] } },
	},
];
