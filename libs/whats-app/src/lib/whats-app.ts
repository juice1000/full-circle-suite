import { Request, Response } from 'express';

/**
 * Verifies the configured Webhook from WhatsApp. This function is called when WhatsApp sends a request to your server to verify that the request is indeed coming from WhatsApp.
 * @returns status code 200 for success, 400 for error
 */
export function whatsAppVerify(req: Request, res: Response) {
  // This is required for verification of the webhook
  const verifyToken = 'webhook-verify-token';
  if (
    req.query['hub.mode'] == 'subscribe' &&
    req.query['hub.verify_token'] == verifyToken
  ) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
  return;
}

/**
 * Retrieves messages from WhatsApp and extracts the message. It will also send a response back to the webhook
 * @returns
 */
export function whatsAppRetreiveMessage(
  req: Request,
  res: Response
): string | null {
  const body_param = req.body;

  if (!body_param) {
    // not from the messages webhook so dont process
    console.log('got here');
    res.sendStatus(400);
    return null;
  } else {
    // TODO: needs to be reworked for more stability
    console.log(body_param.entry[0].changes[0].value.messages[0].text.body);
    res.sendStatus(200);
    return body_param.entry[0].changes[0].value.messages[0].text.body;
  }
}
