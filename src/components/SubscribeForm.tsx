import React from 'react';
import jsonp from 'fetch-jsonp';

export interface SubscribeFormProps {}

const SubscribeForm = ({}: SubscribeFormProps) => {
  const [input, setInput] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{
    result: string;
    msg: string;
  } | null>(null);

  const catchedError = React.useRef(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const onSubmit = async (e: React.FormEvent) => {
    if (catchedError.current) {
      return; // allow default handler
    }

    e.preventDefault();

    setIsSubmitting(true);
    setResult(null);

    try {
      const url = `https://alexeyshmalko.us20.list-manage.com/subscribe/post-json?u=df5985da9e908799c56c21201&id=37d47f19b4&EMAIL=${encodeURIComponent(
        input
      )}&submit=Submit&b_df5985da9e908799c56c21201_37d47f19b4=`;
      const data = await (await jsonp(url, { jsonpCallback: 'c' })).json();
      setResult(data);
      setIsSubmitting(false);
    } catch (e) {
      // This is not a normal mailchimp error (e.g., network error, or
      // request blocked by firefox tracking).
      //
      // Fallback to post.
      setIsSubmitting(false);
      catchedError.current = true;
      // Firefox treats form submit as not user-initiated (because it
      // happens after a promise), so the following line blocks the
      // popup:
      //
      // formRef.current?.submit();
      //
      // So, instead of doing that, we show an error to the user. If
      // the user clicks “Submit” again, the new window should open as
      // intended.
      setResult({
        result: 'error',
        msg: 'Network error occured. Please, try again.',
      });
    }
  };

  const main =
    result?.result === 'success' ? (
      <div className="root">{'Thank you for subscribing!'}</div>
    ) : (
      <>
        <div className="prompt">
          {'Want to receive my 🖋 posts as I publish them?'}
        </div>
        <form
          ref={formRef}
          action="https://alexeyshmalko.us20.list-manage.com/subscribe/post?u=df5985da9e908799c56c21201&amp;id=37d47f19b4"
          method="post"
          id="mc-embedded-subscribe-form"
          name="mc-embedded-subscribe-form"
          className="validate"
          target="_blank"
          noValidate={true}
          onSubmit={onSubmit}
        >
          <div id="mc_embed_signup_scroll">
            <div className="mc-field-group">
              <input
                aria-label="email"
                type="email"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setResult(null);
                }}
                name="EMAIL"
                className="required email"
                id="mce-EMAIL"
                placeholder="Email address"
              />
              <input
                type="submit"
                value="Subscribe"
                name="subscribe"
                id="mc-embedded-subscribe"
                className="button"
                disabled={isSubmitting}
              />
            </div>
            <div id="mce-responses" className="clear foot">
              <div
                className="response"
                id="mce-error-response"
                style={{ display: result ? undefined : 'none' }}
                dangerouslySetInnerHTML={{
                  __html:
                    result?.msg
                      // If error is related to email field, strip the prefix.
                      .replace(/^0 - /, '') ?? '',
                }}
              ></div>
              <div
                className="response"
                id="mce-success-response"
                style={{ display: 'none' }}
              ></div>
            </div>
            {/* real people should not fill this in and expect good things - do not remove this or risk form bot signups */}
            <div
              style={{ position: 'absolute', left: '-5000px' }}
              aria-hidden="true"
            >
              <input
                type="text"
                name="b_df5985da9e908799c56c21201_37d47f19b4"
                tabIndex={-1}
                value=""
                readOnly={true}
              />
            </div>
            {/* <div className="optionalParent">
              <div className="clear foot">
                <p className="brandingLogo">
                <a
                  href="http://eepurl.com/hNaji1"
                  title="Mailchimp - email marketing made easy and fun"
                >
                  <img src="https://eep.io/mc-cdn-images/template_images/branding_logo_text_dark_dtp.svg" />
                </a>
              </p>
              </div>
            </div> */}
          </div>
        </form>

        <style jsx>{`
          .prompt {
            text-align: center;
          }
          form {
            margin-top: 8px;
          }
          #mc_embed_signup_scroll {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .mc-field-group {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            justify-content: center;
          }
          #mce-responses {
            margin-top: 2px;
          }
          #mce-error-response {
            color: #972500;
            font-size: 14px;
          }
          .email {
            border: thin solid #888;
            border-radius: 4px;
            padding: 8px;
          }
          .button {
            border: thin solid #888;
            border-radius: 4px;
            padding: 8px;
            background-color: #f0f0f0;
          }
          .button:hover,
          .button:focus {
            background-color: #f5df23;
          }
        `}</style>
      </>
    );

  return (
    <div className="root">
      <div className="dinkus">❦</div>

      {main}

      <style jsx>{`
        .root {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .dinkus {
          margin: 0 0 var(--primary-spacing);
          font-size: 28px;
        }
      `}</style>
    </div>
  );
};

export default SubscribeForm;
