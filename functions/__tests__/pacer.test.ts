import { describe, it, expect } from "@jest/globals";
import { handler } from '../pacer';
import { HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';

describe('pacer handler', () => {
  const mockContext: HandlerContext = {
    functionName: 'pacer',
    functionVersion: '1.0',
    invokedFunctionArn: '',
    memoryLimitInMB: '128',
    awsRequestId: '',
    logGroupName: '',
    logStreamName: '',
    getRemainingTimeInMillis: () => 0,
    done: () => {},
    fail: () => {},
    succeed: () => {},
    callbackWaitsForEmptyEventLoop: false,
  };

  it('should return a 405 error if method is not POST', async () => {
    const event: HandlerEvent = {
      httpMethod: 'GET',
    } as any;
    const response = (await handler(
      event,
      mockContext,
      () => {}
    )) as HandlerResponse;
    expect(response.statusCode).toBe(405);
    expect(JSON.parse(response.body ?? "")).toEqual({ error: 'Method Not Allowed' });
  });

  it('should return a 400 error if body is missing', async () => {
    const event: HandlerEvent = {
      httpMethod: 'POST',
    } as any;
    const response = (await handler(
      event,
      mockContext,
      () => {}
    )) as HandlerResponse;
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body ?? "")).toEqual({ error: 'Missing request body' });
  });

  it('should return a 400 error if required fields are missing', async () => {
    const event: HandlerEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({ km: '42.195', time: '4_0_0' }),
    } as any;
    const response = (await handler(
      event,
      mockContext,
      () => {}
    )) as HandlerResponse;
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body ?? "")).toEqual({
      error: 'Missing required fields in body: input, km, time',
    });
  });

  it('should return a 400 error for invalid input format', async () => {
    const event: HandlerEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({ input: 'invalid', km: '42.195', time: '4_0_0' }),
    } as any;
    const response = (await handler(
      event,
      mockContext,
      () => {}
    )) as HandlerResponse;
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body ?? "")).toEqual({ error: 'Invalid input format' });
  });

  it('should calculate the time difference correctly (貯金)', async () => {
    const event: HandlerEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        input: '5キロで25分10秒',
        km: '42.195',
        time: '4_0_0',
      }),
    } as any;
    const response = (await handler(
      event,
      mockContext,
      () => {}
    )) as HandlerResponse;
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body ?? "");
    expect(body.status).toBe('success');
    expect(body.message).toBe('5キロで25分10秒は、目標より3分16秒の貯金があります');
  });

  it('should calculate the time difference correctly (借金)', async () => {
    const event: HandlerEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        input: '5キロで29分0秒',
        km: '42.195',
        time: '4_0_0',
      }),
    } as any;
    const response = (await handler(
      event,
      mockContext,
      () => {}
    )) as HandlerResponse;
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body ?? "");
    expect(body.status).toBe('success');
    expect(body.message).toBe('5キロで29分0秒は、目標より34秒の借金があります');
  });
  it('should calculate the time difference correctly (借金, no seconds)', async () => {
    const event: HandlerEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        input: '5キロで29分',
        km: '42.195',
        time: '4_0_0',
      }),
    } as any;
    const response = (await handler(
      event,
      mockContext,
      () => {}
    )) as HandlerResponse;
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body ?? "");
    expect(body.status).toBe('success');
    expect(body.message).toBe('5キロで29分は、目標より34秒の借金があります');
  });
});