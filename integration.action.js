exports.onExecutePostLogin = async (event, api) => {
  //Pull request_id and visitor_id from query string
  let fingerprint = event.request.query.fingerprint;
  var array = fingerprint.split(" ");
  const vid = array[0];
  const rid = array[1];
  //confirm vid and rid values
  console.log(`Fingerprint Pro values, visitor_id: ${vid}, request_id: ${rid}`);
  let metadata = event.user.app_metadata;
  //Capture fingerprint info in Auth0 user profile
  //If user does not have an existing device_id
  if (!metadata.device_id) {
    return api.multifactor.enable("any");
  }

  //force MFA on users logging in from new device
  if (metadata.device_id && !event.user.app_metadata.device_id.includes(vid)) {
    return api.multifactor.enable("any");
  }

  //verify successful MFA before updating record
  if (event.authentication?.methods.find((x) => x.name == "mfa")) {
    //Update metadata if MFA is successful
    if (!metadata.device_id) {
      api.user.setAppMetadata("device_id", [vid]);
      console.log("metadata updated");
    } else if (!metadata.device_id.includes(vid)) {
      let newArr = metadata.device_id;
      newArr.unshift(vid);
      api.user.setAppMetadata("device_id", newArr);
      console.log("MFA triggered based on new device");
    }
  }
};
