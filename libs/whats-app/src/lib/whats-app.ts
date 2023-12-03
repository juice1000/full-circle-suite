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
export async function whatsAppRetreiveMessage(req: Request, res: Response) {
  const body_param = req.body;

  if (!body_param) {
    // not from the messages webhook so dont process
    console.log('got here');
    res.sendStatus(400);
    return null;
  } else {
    // TODO: needs to be reworked for more stability
    if (
      body_param.entry &&
      body_param.entry[0].changes[0].value &&
      body_param.entry[0].changes[0].value.messages
    ) {
      //console.log(body_param.entry[0].changes[0].value.messages[0].text.body);
      return body_param.entry[0].changes[0].value.messages[0];
    } else {
      return null;
    }
  }
}

export function helloWhatsApp() {
  console.log('hello from whatsapp');
  return 'hello from whatsapp';
}
