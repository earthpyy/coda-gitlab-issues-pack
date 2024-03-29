import * as coda from '@codahq/packs-sdk'
import { API_ENDPOINT, HOST } from './constants'

export const pack = coda.newPack()

pack.addNetworkDomain(HOST)

// auth
pack.setUserAuthentication({
  type: coda.AuthenticationType.OAuth2,
  authorizationUrl: `https://${HOST}/oauth/authorize`,
  tokenUrl: `https://${HOST}/oauth/token`,
  scopes: ['api'],

  getConnectionName: async function (context) {
    let response = await context.fetcher.fetch({
      method: 'GET',
      url: `${API_ENDPOINT}/user`,
    })
    return response.body.username
  },
})

// formula: create issue
pack.addFormula({
  name: 'CreateIssue',
  description: 'Create a new issue.',
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: 'projectId',
      description: 'The ID of a GitLab project.',
      autocomplete: async (context, search) => {
        const url = coda.withQueryParams(`${API_ENDPOINT}/projects`, {
          search,
          order_by: 'similarity',
          simple: true,
          with_issues_enabled: true,
        })
        const response = await context.fetcher.fetch({
          method: 'GET',
          url,
          headers: {
            'Content-Type': 'application/json',
          },
        })
        return coda.autocompleteSearchObjects(search, response.body, 'name_with_namespace', 'id')
      },
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: 'title',
      description: 'The title of an issue.',
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: 'description',
      description: 'The description of an issue.',
      optional: true,
    }),
    coda.makeParameter({
      type: coda.ParameterType.Date,
      name: 'dueDate',
      description: 'The due date of an issue.',
      optional: true,
    }),
    coda.makeParameter({
      type: coda.ParameterType.StringArray,
      name: 'labels',
      description: 'The labels to be tagged on an issue.',
      optional: true,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: 'returnField',
      description: 'The name of field to return.',
      optional: true,
      suggestedValue: 'id',
    }),
  ],
  resultType: coda.ValueType.String,
  isAction: true,
  execute: async ([projectId, title, description, dueDate, labels, returnField], context) => {
    const payload = {
      title,
      description,
      due_date: dueDate,
      labels,
    }

    const response = await context.fetcher.fetch({
      method: 'POST',
      url: `${API_ENDPOINT}/projects/${projectId}/issues`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return returnField ? response.body[returnField] : response.body
  },
})
