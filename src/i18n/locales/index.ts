// Registry of all translation namespaces. Each file owns its own strings.
import account from "./account";
import auth from "./auth";
import common from "./common";
import driver from "./driver";
import home from "./home";
import location from "./location";
import notifications from "./notifications";
import onboarding from "./onboarding";
import orders from "./orders";
import payment from "./payment";
import send from "./send";
import store from "./store";

export const namespaces = { account, auth, common, driver, home, location, notifications, onboarding, orders, payment, send, store };
