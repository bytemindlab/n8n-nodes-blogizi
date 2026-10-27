import type {
	IDataObject,
	IExecuteSingleFunctions,
	INodeExecutionData,
	INodeProperties,
	IN8nHttpFullResponse,
} from 'n8n-workflow';

const showOnlyForSite = {
	resource: ['site'],
};

async function splitPublishedPosts(
	this: IExecuteSingleFunctions,
	_items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	const body = (response.body ?? {}) as IDataObject;
	const posts = Array.isArray(body.posts) ? (body.posts as IDataObject[]) : [];

	return posts.map((post) => ({
		json: {
			...post,
			total: body.total,
			hasMore: body.hasMore,
		},
	}));
}

export const siteDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForSite },
		options: [
			{
				name: 'List Posts',
				value: 'listPosts',
				action: 'List published posts',
				description: 'List published posts for a public blog',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/sites/{{$parameter.siteSlug}}/posts',
					},
					output: {
						postReceive: [splitPublishedPosts],
					},
				},
			},
			{
				name: 'Search',
				value: 'search',
				action: 'Search a blog',
				description: 'Search published posts, tags, and nav links',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/sites/{{$parameter.siteSlug}}/search',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'results',
								},
							},
						],
					},
				},
			},
			{
				name: 'Resolve Domain',
				value: 'resolveDomain',
				action: 'Resolve a custom domain',
				description: 'Look up which project slug owns a custom domain',
				routing: {
					request: {
						method: 'GET',
						url: '/api/resolve-domain',
					},
				},
			},
		],
		default: 'listPosts',
	},
	{
		displayName:
			'Site operations are public and do not use the API key. Pageview recording is omitted because it counts toward the account billing quota.',
		name: 'siteNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: showOnlyForSite },
	},
	{
		displayName: 'Project Slug',
		name: 'siteSlug',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'my-blog',
		description: 'Public project slug, as in https://my-blog.app.blogizi.com',
		displayOptions: {
			show: {
				resource: ['site'],
				operation: ['listPosts', 'search'],
			},
		},
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 1,
		displayOptions: { show: { resource: ['site'], operation: ['listPosts'] } },
		routing: { send: { type: 'query', property: 'page' } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 50 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['site'], operation: ['listPosts'] } },
		routing: { send: { type: 'query', property: 'limit' } },
	},
	{
		displayName: 'Tag',
		name: 'tag',
		type: 'string',
		default: '',
		description: 'Optional tag filter',
		displayOptions: { show: { resource: ['site'], operation: ['listPosts'] } },
		routing: {
			send: {
				type: 'query',
				property: 'tag',
				value: '={{ $value || undefined }}',
			},
		},
	},
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['site'], operation: ['search'] } },
		routing: { send: { type: 'query', property: 'q' } },
	},
	{
		displayName: 'Host',
		name: 'host',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'blog.example.com',
		description: 'Custom domain hostname, without a scheme or path',
		displayOptions: { show: { resource: ['site'], operation: ['resolveDomain'] } },
		routing: { send: { type: 'query', property: 'host' } },
	},
];
