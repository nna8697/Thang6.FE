import { API_DOMAIN } from '../config'

export const get = async (path) => {
    const response = await fetch(`${API_DOMAIN}${path}`);
    const result = await response.json();
    return result;
};

export const post = async (path, data, isUpload = false) => {
    const options = {
        method: 'POST',
        body: isUpload ? data : JSON.stringify(data)
    };

    if (!isUpload) {
        options.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
    }

    const response = await fetch(`${API_DOMAIN}${path}`, options);
    const result = await response.json();
    return result;
};


export const del = async (path, data = {}) => {
    const response = await fetch(`${API_DOMAIN}${path}`, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    return result;
};

export const put = async (path, data, isUpload = false) => {
    const options = {
        method: 'PUT',
        body: isUpload ? data : JSON.stringify(data)
    };

    if (!isUpload) {
        options.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        };
    }

    const response = await fetch(`${API_DOMAIN}${path}`, options);
    const result = await response.json();
    return result;
};
