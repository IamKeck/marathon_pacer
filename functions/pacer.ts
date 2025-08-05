import { Handler, HandlerContext } from "@netlify/functions";

export const handler: Handler = async (event, context: HandlerContext) => {
  const input = event.queryStringParameters?.["input"];
  const km = event.queryStringParameters?.["km"];
  const time = event.queryStringParameters?.["time"];

  if (!input || !km || !time) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Missing required query parameters: input, km, time",
      }),
    };
  }

  const match = input.match(
    /(\d+)(?:キロ|km)で(?:(\d+)時間)?(?:(\d+)分)?(?:(\d+)秒)?/
  );

  if (!match) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid input format" }),
    };
  }

  const distance = parseInt(match[1], 10);
  const hours = parseInt(match[2] || "0", 10);
  const minutes = parseInt(match[3] || "0", 10);
  const seconds = parseInt(match[4] || "0", 10);

  const actualTimeInSeconds = hours * 3600 + minutes * 60 + seconds;

  const [targetHours, targetMinutes, targetSeconds] = time
    .split("_")
    .map(Number);
  const targetTimeInSeconds =
    targetHours * 3600 + targetMinutes * 60 + targetSeconds;
  const totalDistance = parseFloat(km);
  const targetPaceInSecondsPerKm = targetTimeInSeconds / totalDistance;
  const idealTimeInSeconds = Math.round(targetPaceInSecondsPerKm * distance);

  const differenceInSeconds = idealTimeInSeconds - actualTimeInSeconds;
  const absoluteDifference = Math.abs(differenceInSeconds);
  const diffMinutes = Math.floor(absoluteDifference / 60);
  const diffSeconds = absoluteDifference % 60;

  const status = differenceInSeconds >= 0 ? "貯金" : "借金";
  const timeDifferenceString =
    (diffMinutes > 0 ? `${diffMinutes}分` : "") +
    (diffSeconds > 0 ? `${diffSeconds}秒` : "");

  const message = `${input}は、目標より${timeDifferenceString}の${status}があります`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      status: "success",
      message,
    }),
  };
};
