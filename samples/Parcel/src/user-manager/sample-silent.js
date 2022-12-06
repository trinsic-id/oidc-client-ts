import { UserManager, settings } from "./sample-settings";
import { log } from "./sample";
window.alert(window.OIDCSettings);
new UserManager(window.OIDCSettings)
    .signinSilentCallback()
    .then(function () {
        log("signin silent callback response success");
    })
    .catch(function (err) {
        console.error(err);
        log(err);
    });
