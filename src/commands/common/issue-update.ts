import { Context } from "probot";

/**
 * This is a rebot reply feature. https://github.com/tidb-community-bots/ti-challenge-bot/issues/148#issue-709668495
 *
 * function `updateNotification` update the rebot reply in the issue body.
 *    Message such as warning\notifacation will fill into `Notification` part in markdown document.
 *    And a new event triggered by user will be update and replace the old message.
 *    But you can still see the record in the historical message
 *
 * function `createOrUpdateStatus` update the chanllenge status in the issue body.
 *
 */

/**
 * Find the Status title text in the file. And catch the text which is before the `<!-- probot:Status -->` (this is an comment, so it is invisible)
 *    `[\r\n]` match any blank character
 *    `([\d\D]*)` match any character, which will be replaced that we expect.
 *    `([\d\D]*)(?=<!-- probot:Status -->)` We set this Anchor to catch message that we want to replace. This RegExp means `([\d\D]*)` is followed by `<!-- probot:Status -->`.
 *    `[\r\n]*[\d\D]` match any blank character and followed by any character
 *
 *
 * Example:
 * ```js
 * const STATUS_REGEX = /(Status).*[\r\n]+([\d\D]*)(?=<!-- probot:Status -->)[\r\n]*[\d\D]*\/i;
 * const issueBody = `## Status
 * this is an example.<!-- probot:Status -->
 * other characters which is not important.
 * `;
 * const StatusData = issueBody.match(STATUS_REGEX); //new notification
 * console.log(StatusData);
 * console.log(StatusData[2]);
 * ```
 * Output:
 * ```
 * [
 *  'Status\n' +
 *  'this is an example.<!-- probot:Status -->\n' +
 *  'other characters which is not important.\n',
 *  'Status',
 *  'this is an example.',
 *  index: 3,
 *  input: '## Status\n' +
 *  'this is an example.<!-- probot:Status -->\n' +
 *  'other characters which is not important.\n',
 *  groups: undefined
 * ]
 * this is an example.
 * ```
 *
 */

const STATUS_REGEX = /(Status).*[\r\n]+([\d\D]*)(?=<!-- probot:Status -->)[\r\n]*[\d\D]*/i;

/**
 * Find the Notification title text in the file. And catch the text which is before the `<!-- probot:Notification -->` (this is an comment, so it is invisible)
 *
 * Catch the text which is before the `<!-- probot:Notification -->`
 *
 *    `[\r\n]` match any blank characters
 *    `([\d\D]*)` match any character, which will be replaced that we expect.
 *    `([\d\D]*)(?=<!-- probot:Notification -->)` We set this Anchor to catch message that we want to replace. This RegExp means `([\d\D]*)` is followed by `<!-- probot:Notification -->`.
 *    `[\r\n]*[\d\D]` match any blank character and followed by any character
 *
 * Example:
 * ```js
 * const STATUS_REGEX = /(:warning:Notification:warning:).*[\r\n]+([\d\D]*)(?=<!-- probot:Notification -->)[\r\n]*[\d\D]*\/i;
 * const issueBody = `## :warning:Notification:warning:
 * this is an example.<!-- probot:Notification -->
 * other characters which is not important.
 * `;
 * const StatusData = issueBody.match(STATUS_REGEX); //new notification
 * console.log(StatusData[2]);
 * console.log(StatusData[2]);
 * ```
 * Output:
 * ```
 * this is an example.
 * ```
 *
 */

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

/**
 * Returns a new string which updated notification in issue body.
 * @param message - the new notification
 * @param issueBody - issue text
 * @param program - The chanllenge program name
 * @return new issue body
 */
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
    newMessage = `@${sender} ${message}`;
  }

  const notificationData = issueBody.match(NOTIFICATION_REGEX); //new notification
  if (notificationData?.length !== 3) {
    return issueBody;
  }

  const newIssuebody = issueBody.replace(notificationData[2], newMessage); //update message
  return newIssuebody;
}

/**
 * Returns a new string which updated challenger and pragram status in issue body.
 * @param issueBody - issue text
 * @param challenger - A challenger
 * @param program - The chanllenge program name
 * @return new issue body
 */
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
    newMessage = `The challenge has not picked yet.
`;
  } else if (program == undefined) {
    newMessage = `Current challenger: @${challenger}
`;
  } else {
    newMessage = `Current challenger: @${challenger}
Current Program: ${program}
`;
  }

  const StatusData = issueBody.match(STATUS_REGEX); //new notification
  if (StatusData?.length !== 3) {
    return issueBody;
  }

  const newIssuebody = issueBody.replace(StatusData[2], newMessage); //update message
  return newIssuebody;
}

/**
 * update new notification message in issue body.
 * @param context - The webhook event context, it must at least contain `owner` `repo` `issue_number` `sender.type` (in the payload event)
 * @param message - New message
 * @param sender - A sender
 */
export async function createOrUpdateNotification(
  context: Context,
  message: string,
  sender?: string
) {
  if (context.isBot === true) {
    return;
  }
  const issueContext = context.issue();
  const issueResponse = await context.github.issues.get(issueContext);
  const issueBody = issueResponse.data.body;
  const newIssuebody = updateNotification(message, issueBody, sender);
  await context.github.issues.update({
    ...issueContext,
    body: newIssuebody,
  });
}

/**
 * update challenger and pragram status in issue body.
 * @param context - The webhook event context, it must at least contain `owner` `repo` `issue_number` `sender.type` (in the payload event)
 * @param sender - A sender
 * @param program - The chanllenge program name
 */
export async function createOrUpdateStatus(
  context: Context,
  sender?: string,
  program?: string
) {
  if (context.isBot === true) {
    return;
  }
  const issueResponse = await context.github.issues.get(context.issue());
  const issueBody = issueResponse.data.body;
  const newIssuebody = updateStatus(issueBody, sender, program);
  await context.github.issues.update({
    ...context.issue(),
    body: newIssuebody,
  });
}
