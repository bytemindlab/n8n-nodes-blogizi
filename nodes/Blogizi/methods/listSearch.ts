import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';

type BlogiziProject = {
	id: string;
	name: string;
	slug: string;
};

type ProjectListResponse = {
	data?: BlogiziProject[];
};

async function loadProjects(this: ILoadOptionsFunctions): Promise<BlogiziProject[]> {
	const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'blogiziApi', {
		method: 'GET',
		url: 'https://blogizi.com/api/account/projects',
		json: true,
	})) as ProjectListResponse;

	return response.data ?? [];
}

function matchesFilter(project: BlogiziProject, filter?: string): boolean {
	if (!filter) return true;
	const query = filter.toLowerCase();
	return project.name.toLowerCase().includes(query) || project.slug.toLowerCase().includes(query);
}

export async function searchProjects(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const projects = await loadProjects.call(this);
	return {
		results: projects.filter((project) => matchesFilter(project, filter)).map((project) => ({
			name: project.name,
			value: project.slug,
			description: project.slug,
			url: `https://${project.slug}.app.blogizi.com`,
		})),
	};
}

export async function searchProjectIds(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const projects = await loadProjects.call(this);
	return {
		results: projects.filter((project) => matchesFilter(project, filter)).map((project) => ({
			name: project.name,
			value: project.id,
			description: project.slug,
			url: `https://${project.slug}.app.blogizi.com`,
		})),
	};
}
