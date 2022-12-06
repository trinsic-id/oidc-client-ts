import { UserManager } from "./sample-settings";
import { log } from "./sample";

new UserManager(window.OIDCSettings)
    .signinCallback()
    .then(function (user) {
        log("signin callback response success", user);
    })
    .catch(function (err) {
        console.error(err);
        log(err);
    });
