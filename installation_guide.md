The Fingerprint and Okta Cloud Identity Connection (CIC) Auth0 (fka as Auth0) integration is designed to provide a secure and frictionless user experience. If a user logs in from a new device, the integration triggers Multi-Factor Authentication (MFA) for added security. Likewise, if a user logs in from a known device, MFA will be bypassed to enable a frictionless user experience.

The integration is powered by Fingerprint Pro's device detection technology, which is an industry-leading solution that quickly and accurately identifies the characteristics of a browser or device. The device information, with unparalleled accuracy, is then used to create a unique and immutable device fingerprint that can be used to securely identify a user's device and detect any malicious activity.

## Prerequisites

1. An Auth0 account and tenant. [Sign up for free](https://auth0.com/signup).
2. A Fingerprint Pro account. [Sign up for free](https://dashboard.fingerprint.com/signup/)

## Set up Fingerprint Pro

To configure the integration with Fingerprint:

1. Create your Fingerprint Pro Account and Log into the dashboard
2. Login to the Fingerprint dashboard https://dashboard.fingerprint.com/login
3. Make sure the correct region is selected during account setup https://dev.fingerprintjs.com/docs/regions
4. Click on “API keys” on the left pane to get your Public and Private keys. The public key will be used in the configuration of your client side application.
5. Follow the quickstart guide here https://dev.fingerprint.com/docs/quick-start-guide Fingerprint offers multiple SDKs for mobile and web applications, choose the most suitable for your application. If you have issues, please contact https://fingerprint.com/support/
6. After integration, redeploy and visit your application
7. Return to your Fingerprint Dashboard, click on "Fingerprint Pro" in the left hand menu and verify a visitorId and RequestId is being returned
8. In your application, find where the Auth0 Login is being called. In this example, I created a wrapped for the Auth0 Login method to pass in the Fingerprint visitorId and the requestId.

```async function loginWithFingerprint() {
if (data) {
return loginWithRedirect({
fingerprint: `${data.visitorId} ${data.requestId}`,
});
}
return console.log(data);
}
```

This is languange dependent and your implementation may look different than this. Ultimately, all you're doing is passing in the visitorId as well as the requestId into Auth0's /authorize URL. Relevant snippets from a React example will be included at the bottom of this guide.

Additional Considerations:
It's important to note that this is only recommended for use with the New Universal Login Experience as it's server-side rendered. Using this integration with Classic UL will result in the additonal parameters being visible to the end user.

The default behavior of this integration is to prompt users who are not already enrolled in an MFA factor to enroll; withthe MFA Type set to 'any' (Any Factors you have enabled in your Auth0 Dashboard)

#### Subdomain Setup:

While the Fingerprint Subdomain integration is not required, we highly recommend configuring this. It increases accuracy by allowing Fingerprint to use first-party cookies and protects from identification requests being blocked by browsers or ad blockers
https://dev.fingerprint.com/docs/subdomain-integration
If more than 1 subdomain needed, setup all of the subdomains together and then add the A records for all domains in your DNS

#### React SPA Snippet examples:

##### //Index.js

```
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
import { FpjsProvider } from "@fingerprintjs/fingerprintjs-pro-react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
<React.StrictMode>
<FpjsProvider
cacheLocation="memory"
loadOptions={{
        apiKey: process.env.REACT_APP_FPJS_PUBLIC_API_KEY,
        endpoint: ["fp.YOURDOMAIN.com"],
        region: "us",
      }} >
<Auth0Provider
            domain={process.env.REACT_APP_DOMAIN}
            clientId={process.env.REACT_APP_CLIENT_ID}
            redirectUri={window.location.origin}
          >
<App />
</Auth0Provider>
,
</FpjsProvider>
</React.StrictMode>

```

##### //NavBar.js

```
import { useAuth0 } from "@auth0/auth0-react";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";

const Navbar = () => {
const navigate = useNavigate();
const dispatch = useDispatch();

const { data } = useVisitorData();
const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();

    async function loginWithFingerprint() {
    if (data) {
      return loginWithRedirect({
        fingerprint: `${data.visitorId} ${data.requestId}`,
      });
    }
    return console.log(data);

}

  <Button onClick={loginWithFingerprint}>
   <AccountCircleOutlinedIcon />
       SIGN IN
   </Button>
```

## Add the Auth0 Action

**Note:** Once the Action is successfully deployed, all logins for your tenant will be processed by this integration. Before activating the integration in production, [install and verify this Action on a test tenant](https://auth0.com/docs/get-started/auth0-overview/create-tenants/set-up-multiple-environments).

1. Select **Add Integration** (at the top of this page).
1. Read the necessary access requirements, and select **Continue**.
1. Add the integration to your Library by selecting **Create**.
1. In the modal that appears, select the **Add to flow** link.
1. Drag the Action into the desired location in the flow.
1. Select **Apply Changes**.

## Results

Upon a user's login, this Action adds the user's device ID to an array in the app_metadata. Each time a user logs in from a new device, they will be prompted to provide a second factor authentication. On successful authentication, the device ID is added to the array of known devices.

## Troubleshooting

Fingerprint Documentation: https://dev.fingerprint.com/docs
Language Specific Fingeprint Repos: https://github.com/orgs/fingerprintjs/repositories
Fingerprint Support: https://fingerprint.com/support/
