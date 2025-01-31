const should = require('should')
const authenticator = require('../lib/authenticator')
const querystring = require('querystring')
const strava = require('../')
const nock = require('nock')


const _tokenExchangeCode = 'a248c4c5dc49e71336010022efeb3a268594abb7'

describe('oauth_test', function () {
  describe('#getRequestAccessURL()', function () {
    it('should return the full request access url', function () {
      const targetUrl = 'https://www.strava.com/oauth/authorize?' +
        querystring.stringify({
          client_id: authenticator.getClientId(),
          redirect_uri: authenticator.getRedirectUri(),
          response_type: 'code',
          scope: 'view_private,write'
        })

      const url = strava.oauth.getRequestAccessURL({
        scope: 'view_private,write'
      })

      url.should.be.exactly(targetUrl)
    })
  })

  describe('#deauthorize()', function () {
    it('Should have method deauthorize', function () {
      strava.oauth.should.have.property('deauthorize')
    })

    it('Should return 401 with invalid token', function (done) {
      strava.oauth.deauthorize({ access_token: 'BOOM' }, function (err, payload) {
        should(err).be.null()
        should(payload).have.property('message').eql('Authorization Error')
        done()
      })
    })

    it('Should return 401 with invalid token (Promise API)', function () {
      return strava.oauth.deauthorize({ access_token: 'BOOM' })
        .then(function (payload) {
          (payload).should.have.property('message').eql('Authorization Error')
        })
    })
    // Not sure how to test since we don't have a token that we want to deauthorize
  })

  // TODO: Figure out a way to get a valid oAuth code for the token exchange
  describe.skip('#getToken()', function () {
    it('should return an access_token', function (done) {
      strava.oauth.getToken().then((err, payload) => {
        should(payload).have.property('message').eql('Authorization Error')
        should(err).be.null()
        done()
      })
    })

    it('Should return 401 with invalid token (Promise API)', function () {
      return strava.oauth.deauthorize({ access_token: 'BOOM' })
        .then(function (payload) {
          (payload).should.have.property('message').eql('Authorization Error')
        })
    })
    // Not sure how to test since we don't have a token that we want to deauthorize
  })

  // TODO: Figure out a way to get a valid oAuth code for the token exchange
  describe.skip('#getToken()', function () {
    it('should return an access_token', function (done) {
      strava.oauth.getToken(_tokenExchangeCode, function (err, payload) {
        should(err).be.null()
        done()
      })
    })
  })

  describe('#refreshToken()', () => {
    before(() => {
     nock('https://www.strava.com')
      .filteringPath(() => '/oauth/token')
      .post(/^\/oauth\/token/)
      .reply(200, [
        {
          "access_token": "38c8348fc7f988c39d6f19cf8ffb17ab05322152",
          "expires_at": 1568757689,
          "expires_in": 21432,
          "refresh_token": "583809f59f585bdb5363a4eb2a0ac19562d73f05",
          "token_type": "Bearer"
        }
      ])
    })
    it('should return expected response when refreshing token', () => {
      return strava.oauth.refreshToken('MOCK DOESNT CARE IF THIS IS VALID')
        .then(result => {
          result.should.eql([
            {
              "access_token": "38c8348fc7f988c39d6f19cf8ffb17ab05322152",
              "expires_at": 1568757689,
              "expires_in": 21432,
              "refresh_token": "583809f59f585bdb5363a4eb2a0ac19562d73f05",
              "token_type": "Bearer"
            }
          ])
        })
    })
  })
})
