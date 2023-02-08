exports.onExecutePostLogin = async (event, api) => {
  //Pull request_id and visitor_id from query string
  let fingerprint = event.request.query.fingerprint;
  var array = fingerprint.split(" ");
  const vid = array[0];
  const rid = array[1];
  //confirm vid and rid values
  console.log(`Fingerprint Pro values, visitor_id: ${vid}, request_id: ${rid}`);

  //spin up fingerpint client
  const {
    FingerprintJsServerApiClient,
    Region,
  } = require("@fingerprintjs/fingerprintjs-pro-server-api");
  //filter results by request_id and # of results. Ensures returned visit matches the fingerprint done by the client
  const filter = {
    request_id: rid,
    limit: 1,
  };

  // Init client with the given region and the secret api_key
  const client = new FingerprintJsServerApiClient({
    region: Region.Global,
    apiKey: event.secrets.api_key,
  });

  let count = event.user.app_metadata.consecutiveLoginsFromDevice;
  let metadata = event.user.app_metadata;
  //Capture fingerprint info in Auth0 user profile
  //If user does not have an existing device_id, set on profile
  if (!metadata.device_id) {
    api.multifactor.enable("any");
    api.user.setAppMetadata("device_id", [vid]);
  }
  //create a counter that keeps track of user logins from device
  if (!metadata.consecutiveLoginsFromDevice) {
    return api.user.setAppMetadata("consecutiveLoginsFromDevice", 1);
    //add to counter if user device is consistent with previous login
  } else if (metadata.device_id[0] === vid) {
    console.log("login count updated");
    return api.user.setAppMetadata("consecutiveLoginsFromDevice", count + 1);
    //need logic for edge cases where user has a device_id with no count or vice versa
  } else {
    console.log("Something went wrong");
  }

  //force MFA on users logging in from new device
  if (!event.user.app_metadata.device_id.includes(vid)) {
    api.multifactor.enable("any");
    let newArr = metadata.device_id;
    newArr.unshift(vid);
    api.user.setAppMetadata("device_id", newArr);
    api.user.setAppMetadata("consecutiveLoginsFromDevice", 1);
    console.log("MFA triggered based on new device");
  }
};
