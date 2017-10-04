import axios from 'axios'
import queryString from 'query-string'
import pathToRegexp from 'path-to-regexp'


function _dataToQuery(url, data) {
    if (data === undefined) {
        return url
    }
    const query = queryString.stringify(data)
    return `${url}?${query}`
}

function _pathToUrl(path, params) {
    const toUrl = pathToRegexp.compile(path)
    return toUrl(params)
}


function _urlHttpConfig(api, data) {
    const method = api.method;
    let url = api.url;

    if (method === 'GET') {
        url = _dataToQuery(url, data)
    }
    return {
        method,
        url,
        data
    }
}

function _pathHttpConfig(api, data, params) {
    const {method, path} = api
    let url = _pathToUrl(path, params)
    if (method === 'GET') {
        url = _dataToQuery(url, data)
    }
    return {
        method,
        url,
        data
    }
}

function _getConfig(api, data, params) {
    let config = {}
    if ('path' in api) {
        config = _pathHttpConfig(api, data, params)
    } else if ('url' in api) {
        config = _urlHttpConfig(api, data)
    }
    return config
}

export default class Http {

    constructor(baseURL) {
        this.axios = axios.create({
            baseURL,
            timeout: 1000,
            headers: {'Content-Type': 'application/json'}
        })
        this.api = {}
    }

    addApi(api) {
        /*
        {
            API_NAME: {
                method: "",
                path: ""
                url: ""
            }
        }
        */
        this.api = {...this.api, ...api}
    }

    setAuthHeader(authToken) {
        this.axios.defaults.headers.common['Authorization'] = authToken
    }

    request = async (apiName, data, params) => {
        const api = this.api[apiName]
        config = _getConfig(api, data, params)
        response = await this.axios.request(config)
        return response.data
    }

    rawRequest(apiName, data, params) {
        const api = this.api[apiName]
        config = _getConfig(api, data, params)
        return this.axios.request(config)
    }
}
