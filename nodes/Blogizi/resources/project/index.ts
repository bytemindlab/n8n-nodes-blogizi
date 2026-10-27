import type { INodeProperties } from 'n8n-workflow';

import { limitResultFields } from '../../shared/fields';

const showOnlyForProjects = {
	resource: ['project'],
};

export const projectDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForProjects },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many projects',
				description: 'List blogs for the authenticated account',
				routing: {
					request: {
						method: 'GET',
						url: '/api/account/projects',
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
		],
		default: 'getAll',
	},
	...limitResultFields({ show: { resource: ['project'], operation: ['getAll'] } }),
];
