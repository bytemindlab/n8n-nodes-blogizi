import type { INodeProperties } from 'n8n-workflow';

import { projectSlugField } from '../../shared/fields';

const showOnlyForSearchAnalytics = {
	resource: ['searchAnalytics'],
};

export const searchAnalyticsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForSearchAnalytics },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get search analytics',
				description: 'Read cached Google Search Console performance',
				routing: {
					request: {
						method: 'GET',
						url: '/api/search-analytics',
					},
				},
			},
		],
		default: 'get',
	},
	{
		displayName:
			'Bind a Search Console property in the Blogizi dashboard before using this operation. A range that has not been synced yet is fetched from Google on the first request.',
		name: 'searchAnalyticsNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: showOnlyForSearchAnalytics },
	},
	projectSlugField({
		show: {
			resource: ['searchAnalytics'],
			operation: ['get'],
		},
	}),
	{
		displayName: 'Days',
		name: 'days',
		type: 'options',
		options: [
			{ name: '7', value: '7' },
			{ name: '28', value: '28' },
			{ name: '90', value: '90' },
			{ name: '180', value: '180' },
			{ name: '365', value: '365' },
			{ name: '480', value: '480' },
		],
		default: '28',
		description: 'Length of the reporting window',
		displayOptions: { show: showOnlyForSearchAnalytics },
		routing: {
			send: {
				type: 'query',
				property: 'days',
			},
		},
	},
	{
		displayName: 'Refresh',
		name: 'refresh',
		type: 'boolean',
		default: false,
		description: 'Whether to sync Search Console before responding. Limited to once every 5 minutes.',
		displayOptions: { show: showOnlyForSearchAnalytics },
		routing: {
			send: {
				type: 'query',
				property: 'refresh',
				value: '={{ $value ? "1" : undefined }}',
			},
		},
	},
];
