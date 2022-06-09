/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {Platform, LinkKind} from "../types.js";
import {Client} from "./Client.js";
import {data} from "./ElementData.js";

const trustedWebInstances = [
    "app.element.io",   // first one is the default one
    "develop.element.io",
    "chat.fedoraproject.org",
    "chat.fosdem.org",
    "chat.mozilla.org",
    "webchat.kde.org",
];

/**
 * Information on how to deep link to a given matrix client.
 */
export class Element extends Client {
    constructor() {
        super(data);
    }

    get appleAssociatedAppId() { return "7J4U792NQT.im.vector.app"; }

    getDeepLink(platform, link) {
        let fragmentPath;
        switch (link.kind) {
            case LinkKind.User:
                fragmentPath = `user/${link.identifier}`;
                break;
            case LinkKind.Room:
                fragmentPath = `room/${link.identifier}`;
                break;
            case LinkKind.Group:
                fragmentPath = `group/${link.identifier}`;
                break;
            case LinkKind.Event:
                fragmentPath = `room/${link.identifier}/${link.eventId}`;
                break;
        }
        const isWebPlatform = platform === Platform.DesktopWeb || platform === Platform.MobileWeb;
        if (isWebPlatform || platform === Platform.iOS) {
            let instanceHost = trustedWebInstances[0];
            // we use app.element.io which iOS will intercept, but it likely won't intercept any other trusted instances
            // so only use a preferred web instance for true web links.
            if (isWebPlatform && trustedWebInstances.includes(link.webInstances[this.id])) {
                instanceHost = link.webInstances[this.id];
            }
            return `https://${instanceHost}/#/${encodeURIComponent(fragmentPath)}`;
        } else if (platform === Platform.Linux || platform === Platform.Windows || platform === Platform.macOS) {
            return `element://vector/webapp/#/${encodeURIComponent(fragmentPath)}`;
        } else {
            return `element://${fragmentPath}`;
        }
    }

    canInterceptMatrixToLinks(platform) {
        return platform === Platform.Android;
    }

    getPreferredWebInstance(link) {
        const idx = trustedWebInstances.indexOf(link.webInstances[this.id])
        return idx === -1 ? undefined : trustedWebInstances[idx];
    }
}
