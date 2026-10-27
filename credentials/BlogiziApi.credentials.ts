import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BlogiziApi implements ICredentialType {
	name = 'blogiziApi';

	displayName = 'Blogizi API';

	icon = {
		light: 'file:../nodes/Blogizi/blogizi.svg',
		dark: 'file:../nodes/Blogizi/blogizi.dark.svg',
	} as const;

	documentationUrl = 'https://blogizi.com/docs/api-authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'Account API key from Dashboard → Account → API',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://blogizi.com',
			url: '/api/account/projects',
			method: 'GET',
		},
	};
}
