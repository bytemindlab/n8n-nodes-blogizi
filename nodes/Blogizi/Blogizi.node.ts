import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

import { searchProjectIds, searchProjects } from './methods/listSearch';
import { postDescription } from './resources/post';
import { projectDescription } from './resources/project';
import { searchAnalyticsDescription } from './resources/searchAnalytics';
import { siteDescription } from './resources/site';

export class Blogizi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Blogizi',
		name: 'blogizi',
		icon: { light: 'file:blogizi.svg', dark: 'file:blogizi.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Create, update, and publish Blogizi posts',
		defaults: {
			name: 'Blogizi',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'blogiziApi',
				required: true,
				displayOptions: {
					show: {
						resource: ['post', 'project', 'searchAnalytics'],
					},
				},
			},
		],
		requestDefaults: {
			baseURL: 'https://blogizi.com',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Post',
						value: 'post',
					},
					{
						name: 'Project',
						value: 'project',
					},
					{
						name: 'Search Console',
						value: 'searchAnalytics',
					},
					{
						name: 'Site',
						value: 'site',
					},
				],
				default: 'post',
			},
			...postDescription,
			...projectDescription,
			...searchAnalyticsDescription,
			...siteDescription,
		],
	};

	methods = {
		listSearch: {
			searchProjects,
			searchProjectIds,
		},
	};
}
