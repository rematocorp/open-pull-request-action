import * as core from '@actions/core'
const { Octokit } = require('@octokit/core')

let octokit
let retryCount = 0
const maxAttempts = 3 // https://youtu.be/-IOMNUayJjI

async function run(): Promise<void> {
	const githubToken = core.getInput('github-token', { required: true })
	const head = core.getInput('from-branch', { required: true })
	const base = core.getInput('to-branch', { required: true })
	const owner = core.getInput('repository-owner', { required: true })
	const repo = core.getInput('repository', { required: true })

	octokit = new Octokit({ auth: githubToken })

	const response = await octokit.request('POST /repos/{owner}/{repo}/pulls', {
		owner,
		repo,
		head,
		base,
		title: `Auto merge ${head} to ${base}`,
	})

	const pull_number = response.data.number

	core.info('PR created')

	await returnPullRequestNumber({
		repo,
		owner,
		pull_number,
	})
}

async function returnPullRequestNumber(requestData: {
	owner: string
	repo: string
	pull_number: string
}): Promise<void> {
	const pull_request = await octokit.request(`GET /repos/{owner}/{repo}/pulls/{pull_number}`, requestData)

	if (pull_request.data.mergeable_state == 'unknown') {
		if (retryCount >= maxAttempts) {
			core.error(`Get pr status max attempts limit exceeded, payload: ${JSON.stringify(requestData)}`)

			process.exit(1)
		}
		retryCount++
		await delay(1000)

		return returnPullRequestNumber(requestData)
	}

	if (pull_request.data.mergeable) {
		core.setOutput('pull_number', requestData.pull_number)
	} else {
		core.error(`Pull request #${requestData.pull_number} is not mergeable`)
		process.exit(1)
	}
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

run().then()
