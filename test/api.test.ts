import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  Configuration,
  MomentsApi,
  PostMomentsRequest
} from '../dist';
import {
  ACCESS_TOKEN,
  BASE_PATH,
  SCHEMA_ID,
  PROJECT_ID,
} from './utils';

let mock: MockAdapter;
let api: MomentsApi;

beforeAll(() => {
  mock = new MockAdapter(axios);
  const config = new Configuration({
    accessToken: ACCESS_TOKEN,
    basePath: BASE_PATH,
  });
  api = new MomentsApi(config);
});

afterEach(() => {
  mock.reset();
});

it('should be able to post moment', async () => {
  const message = 'hello world';

  const data: PostMomentsRequest = {
    schemaId: SCHEMA_ID,
    projectId: PROJECT_ID,
    data: {
      message,
    },
  };

  mock.onPost(`${BASE_PATH}/moments`).reply(200, {
    momentId: 'mom_abc123',
  });

  const thenFn = jest.fn((response) => {
    expect(response?.data?.momentId).toEqual('mom_abc123');
  });
  const catchFn = jest.fn();

  await api.postMoments(data).then(thenFn).catch(catchFn);

  expect(mock.history.post[0].url).toEqual(`${BASE_PATH}/moments`);
  expect(mock.history.post[0].data).toBe(JSON.stringify(data));

  expect(thenFn).toHaveBeenCalled();
  expect(catchFn).not.toHaveBeenCalled();
});

it('should not be able to post moment', async () => {
  const data: PostMomentsRequest = {
    schemaId: SCHEMA_ID,
    projectId: PROJECT_ID,
    data: {
      message: 'hello world',
    },
  };
  const response = {
    message: 'validation failed',
    errors: [
      'missing datetime',
      'missing author',
      'missing apiKey',
    ],
  };

  mock.onPost(`${BASE_PATH}/moments`).reply(422, response);

  const thenFn = jest.fn();
  const catchFn = jest.fn((error) => {
    expect(error.response.data).toStrictEqual(response);
  });

  await api.postMoments(data).then(thenFn).catch(catchFn);

  expect(mock.history.post[0].url).toEqual(`${BASE_PATH}/moments`);
  expect(mock.history.post[0].data).toBe(JSON.stringify(data));

  expect(thenFn).not.toHaveBeenCalled();
  expect(catchFn).toHaveBeenCalled();
});
