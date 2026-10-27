import type {
	IDataObject,
	IDisplayOptions,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

const bodyProperty = (property: string): INodeProperties['routing'] => ({
	send: {
		type: 'body',
		property,
	},
});

function readLocatorValue(value: string | IDataObject): string {
	if (typeof value === 'string') return value;
	return String(value.value ?? '');
}

async function setProjectHeader(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const projectSlug = this.getNodeParameter('projectSlug', '', { extractValue: true }) as
		| string
		| IDataObject;
	const slug = readLocatorValue(projectSlug);
	if (!slug) return requestOptions;

	requestOptions.headers = {
		...requestOptions.headers,
		'X-Blogizi-Project': slug,
	};
	return requestOptions;
}

export function projectSlugField(displayOptions: IDisplayOptions): INodeProperties {
	return {
		displayName: 'Project',
		name: 'projectSlug',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		description:
			'Blog to use. Required when the account has more than one project. With one project, Blogizi selects it automatically.',
		displayOptions,
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchProjects',
					searchable: true,
				},
			},
			{
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				placeholder: 'my-blog',
				url: '=https://{{$value}}.app.blogizi.com',
			},
		],
		routing: {
			send: {
				preSend: [setProjectHeader],
			},
		},
	};
}

export function projectIdField(displayOptions: IDisplayOptions): INodeProperties {
	return {
		displayName: 'Project',
		name: 'projectId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'Project ID from List Projects. This route uses the ID, not the public slug.',
		displayOptions,
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchProjectIds',
					searchable: true,
				},
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				placeholder: '665f1c2e4b3a9d0012ab34cd',
			},
		],
	};
}

export function limitResultFields(displayOptions: IDisplayOptions): INodeProperties[] {
	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			default: false,
			description: 'Whether to return all results or only up to a given limit',
			displayOptions,
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			typeOptions: {
				minValue: 1,
			},
			default: 50,
			description: 'Max number of results to return',
			displayOptions: {
				show: {
					...displayOptions.show,
					returnAll: [false],
				},
			},
			routing: {
				output: {
					maxResults: '={{$value}}',
				},
			},
		},
	];
}

const postAdditionalFieldOptions: INodeProperties[] = [
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		description: 'Meta description, ideally 160 characters or fewer',
		routing: bodyProperty('description'),
	},
	{
		displayName: 'Keyword',
		name: 'keyword',
		type: 'string',
		default: '',
		description: 'Primary SEO keyword',
		routing: bodyProperty('keyword'),
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		typeOptions: { rows: 6 },
		default: '',
		description:
			'Markdown body. For inline images, upload with type Content, then put the returned markdown here.',
		routing: bodyProperty('content'),
	},
	{
		displayName: 'Cover Image URL',
		name: 'coverImageUrl',
		type: 'string',
		default: '',
		description: 'Public cover image URL. On update, leave this field out to keep the current cover.',
		routing: bodyProperty('coverImageUrl'),
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
		routing: bodyProperty('status'),
	},
	{
		displayName: 'CTA Title',
		name: 'ctaTitle',
		type: 'string',
		default: '',
		routing: bodyProperty('ctaTitle'),
	},
	{
		displayName: 'CTA Subtitle',
		name: 'ctaSubtitle',
		type: 'string',
		default: '',
		routing: bodyProperty('ctaSubtitle'),
	},
	{
		displayName: 'CTA Button Label',
		name: 'ctaButtonLabel',
		type: 'string',
		default: '',
		routing: bodyProperty('ctaButtonLabel'),
	},
	{
		displayName: 'CTA Button URL',
		name: 'ctaButtonUrl',
		type: 'string',
		default: '',
		description: 'Title, button label, and URL are required together to override the project CTA',
		routing: bodyProperty('ctaButtonUrl'),
	},
	{
		displayName: 'Sidebar CTA Title',
		name: 'sidebarCtaTitle',
		type: 'string',
		default: '',
		routing: bodyProperty('sidebarCtaTitle'),
	},
	{
		displayName: 'Sidebar CTA Text',
		name: 'sidebarCtaText',
		type: 'string',
		default: '',
		routing: bodyProperty('sidebarCtaText'),
	},
	{
		displayName: 'Sidebar CTA Bullets',
		name: 'sidebarCtaBullets',
		type: 'string',
		typeOptions: { multipleValues: true },
		default: [],
		routing: bodyProperty('sidebarCtaBullets'),
	},
	{
		displayName: 'Sidebar CTA Button Label',
		name: 'sidebarCtaButtonLabel',
		type: 'string',
		default: '',
		routing: bodyProperty('sidebarCtaButtonLabel'),
	},
	{
		displayName: 'Sidebar CTA Button URL',
		name: 'sidebarCtaButtonUrl',
		type: 'string',
		default: '',
		description: 'Title, button label, and URL are required together to override the sidebar CTA',
		routing: bodyProperty('sidebarCtaButtonUrl'),
	},
];

const scheduledAtField: INodeProperties = {
	displayName: 'Scheduled At',
	name: 'scheduledAt',
	type: 'dateTime',
	default: '',
	description:
		'Future time keeps the post as a draft until then. A value without a timezone uses the project timezone.',
	routing: bodyProperty('scheduledAt'),
};

export function postAdditionalFields(
	displayOptions: IDisplayOptions,
	mode: 'create' | 'update',
): INodeProperties {
	const options =
		mode === 'create'
			? [...postAdditionalFieldOptions.filter((field) => field.name !== 'status'), scheduledAtField]
			: postAdditionalFieldOptions;

	return {
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		description: 'Optional post fields. On update, omitted fields keep their current values.',
		displayOptions,
		options,
	};
}
