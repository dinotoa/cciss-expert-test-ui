import { GraphQLClient } from 'graphql-request'

export type FetchError = {
  httpCode?: number
  message?: string
}

export interface FetchResponse<ResponseType> {
  data?: ResponseType
  error?: FetchError
}


export async function jsonDataFetch<ResponseType>(urlString: string,
  params?: Record<string, string>):
  Promise<FetchResponse<ResponseType>> {
  const url = new URL(urlString)
  if (typeof params === 'object') {
    url.search = new URLSearchParams(params).toString()
  }
  try {
    const response = await fetch(url, {
      credentials: 'omit',
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    })
    // TODO check json errors
    if (response.ok) {
      const data = await response.json()
      return { data, error: undefined }
    }
    return {
      data: undefined, error: {
        httpCode: response.status
      }
    }
  } catch (error) {
    console.error(error)
    return { error: error as FetchError }
  }
}

export async function graphqlDataFetch<ResponseType>(url: string, query: string, variables: object = {}):
  Promise<FetchResponse<ResponseType>> {
  try {
    const graphQLClient = new GraphQLClient(url, {})
    const data = await graphQLClient.request(query, variables)

    return { data: data as ResponseType, }
  } catch (error) {
    console.error(error)
    return { error: { httpCode: 500, message: "error requesting graphql data" } }
  }
}
