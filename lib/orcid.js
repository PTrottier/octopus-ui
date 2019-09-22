const request = require('request');
const config = require('./config');

const REDIRECT_URI = `${config.baseUrl}/auth/orcid/verify`;
const ORCID_CLIENT_ID = config.orcidClientId;
const ORCID_CLIENT_SECRET = config.orcidClientSecret;

function generateAuthRedirect(state, returnPath) {
  return `https://orcid.org/oauth/authorize?state=${state}&client_id=${ORCID_CLIENT_ID}&response_type=code&scope=/authenticate&redirect_uri=${REDIRECT_URI}?return_path=${returnPath}`;
}

/**
 *
 *  Example response:
 *  {
 *    access_token: 'xxxx',
 *    token_type: 'bearer',
 *    refresh_token: 'yyyy',
 *    expires_in: 631138518,
 *    scope: '/authenticate',
 *    name: 'John Smith',
 *    orcid: '0000-0000-0000-0000'
 *  }
 */
function getOAuthAccessGrant(authCode, callback) {
  const payload = {
    client_id: ORCID_CLIENT_ID,
    client_secret: ORCID_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code: authCode,
  };

  return request.post('https://orcid.org/oauth/token', { form: payload }, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      return callback(error || response.statusCode);
    }

    const authData = JSON.parse(body);
    return callback(null, authData);
  });
}

function getEmailForPerson(orcid, accessToken, callback) {
  const reqUrl = `https://pub.orcid.org/v2.1/${orcid}/email`;
  const reqOpts = {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Octopus Web App',
      Authorization: `Bearer ${accessToken}`,
    },
  };

  request(reqUrl, reqOpts, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      return callback(error || response.statusCode);
    }

    const details = JSON.parse(body);
    const email = details.email.length >= 1 ? details.email[0].email : null;

    return callback(null, email);
  });
}

function getPersonDetails(orcid, accessToken, callback) {
  const reqUrl = `https://pub.orcid.org/v2.1/${orcid}/person`;
  const reqOpts = {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Octopus Web App',
      Authorization: `Bearer ${accessToken}`,
    },
  };

  request(reqUrl, reqOpts, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      return callback(error || response.statusCode);
    }

    const details = JSON.parse(body);
    return callback(null, details);
  });
}

function search(query, callback) {
  // `https://pub.orcid.org/v2.1/search?q=${query}`
  return callback(null, {});
}

module.exports = {
  generateAuthRedirect,
  getOAuthAccessGrant,
  getEmailForPerson,
  getPersonDetails,
  search,
};