import { Context } from "probot";
const STATUS_REGEX = /(Status).*[\r\n]+([\d\D]*)(?=<!-- probot:Status -->)[\r\n]*[\d\D]*/i;
const NOTIFICATION_REGEX = /(:warning:Notification:warning:).*[\r\n]+([\d\D]*)(?=<!-- probot:Notification -->)[\r\n]*[\d\D]*/i;
export enum IssueNotificationHead {
  STATUS = `


## Status

xxx<!-- probot:Status -->

`,

  NOTIFICATION = `


## :warning:Notification:warning:

xxx<!-- probot:Notification -->

`,
}

export function updateNotification(
  message: string,
  issueBody: string,
  sender?: string
): string {
  const reg = /## :warning:Notification:warning:/i;
  if (!reg.test(issueBody)) {
    issueBody = issueBody + IssueNotificationHead.NOTIFICATION;
  }
  let newMessage: string = message;
  if (sender !== undefined) {
    newMessage = "@" + sender + " " + message;
  }

  const notificationData = issueBody.match(NOTIFICATION_REGEX); //new notification
  if (notificationData?.length !== 3) {
    return issueBody;
  }

  const newIssuebody = issueBody.replace(notificationData[2], newMessage); //update message
  return newIssuebody;
}

export function updateStatus(
  issueBody: string,
  challenger?: string,
  program?: string
): string {
  const reg = /## Status/i;
  if (!reg.test(issueBody)) {
    issueBody = issueBody + IssueNotificationHead.STATUS;
  }

  let newMessage: string;

  if (program === undefined && challenger === undefined) {
    newMessage = `&nbsp;&nbsp; The challenge has not picked yet.
`;
  } else if (program == undefined) {
    newMessage = `&nbsp;&nbsp;Current challenger: @${challenger}
`;
  } else {
    newMessage = `&nbsp;&nbsp;Current challenger: @${challenger}
&nbsp;&nbsp;Current Program: ${program}
`;
  }

  const StatusData = issueBody.match(STATUS_REGEX); //new notification
  if (StatusData?.length !== 3) {
    return issueBody;
  }

  const newIssuebody = issueBody.replace(StatusData[2], newMessage); //update message
  return newIssuebody;
}

export async function createOrUpdateNotification(
  context: Context,
  message: string,
  sender?: string
) {
  const issueContext = context.issue();
  const issueResponse = await context.github.issues.get(issueContext);
  const issueBody = issueResponse.data.body;
  const newIssuebody = updateNotification(message, issueBody, sender);
  await context.github.issues.update({
    ...issueContext,
    body: newIssuebody,
  });
}

export async function createOrUpdateStatus(
  context: Context,
  sender?: string,
  program?: string
) {
  const issueResponse = await context.github.issues.get(context.issue());
  const issueBody = issueResponse.data.body;
  const newIssuebody = updateStatus(issueBody, sender, program);
  await context.github.issues.update({
    ...context.issue(),
    body: newIssuebody,
  });
}
