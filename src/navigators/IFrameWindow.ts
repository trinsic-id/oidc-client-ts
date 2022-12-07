// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.

import { Logger } from "../utils";
import { ErrorTimeout } from "../errors";
import type { NavigateParams, NavigateResponse } from "./IWindow";
import { AbstractChildWindow } from "./AbstractChildWindow";
import { DefaultSilentRequestTimeoutInSeconds } from "../UserManagerSettings";
import MicroModal from "micromodal";
MicroModal.init();
/**
 * @public
 */
export interface IFrameWindowParams {
    silentRequestTimeoutInSeconds?: number;
    hidden: boolean;
    parentId?: string;
}

/**
 * @internal
 */
export class IFrameWindow extends AbstractChildWindow {
    protected readonly _logger = new Logger("IFrameWindow");
    private _frame: HTMLIFrameElement | null;
    private _timeoutInSeconds: number;

    public constructor({
        silentRequestTimeoutInSeconds = DefaultSilentRequestTimeoutInSeconds,
        hidden = false,
    }: IFrameWindowParams) {
        super();
        this._timeoutInSeconds = silentRequestTimeoutInSeconds;

        this._frame = IFrameWindow.createVisibleIframe();
        this._window = this._frame.contentWindow;
    }

    private static createHiddenIframe(): HTMLIFrameElement {
        const iframe = window.document.createElement("iframe");

        // shotgun approach
        iframe.style.visibility = "hidden";
        iframe.style.position = "fixed";
        iframe.style.left = "-1000px";
        iframe.style.top = "0";
        iframe.width = "0";
        iframe.height = "0";
        iframe.setAttribute(
            "sandbox",
            "allow-scripts allow-forms allow-same-origin",
        );

        window.document.body.appendChild(iframe);
        return iframe;
    }

    private static createVisibleIframe(): HTMLIFrameElement {
        const iframe = window.document.createElement("iframe");

        // shotgun approach
        iframe.style.position = "absolute";
        iframe.style.left = "0";
        iframe.style.top = "0";
        iframe.width = "100%";
        iframe.height = "100%";
        iframe.setAttribute(
            "sandbox",
            "allow-scripts allow-forms allow-same-origin",
        );

        let iframeParent = window.document.getElementById(
            "trinsic-iframe-parent",
        );
        if (!iframeParent) {
            const html = `<div class="modal micromodal-slide" id="iframe-modal" aria-hidden="true">
            <div class="modal__overlay" tabindex="-1" data-micromodal-close>
              <div
                class="modal__container"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-1-title"
              >
                <header class="modal__header">
                  <h2 class="modal__title" id="modal-1-title">
                    Trinsic
                  </h2>
                  <button
                    class="modal__close"
                    aria-label="Close modal"
                    data-micromodal-close
                  ></button>
                </header>
                <main class="modal__content" id="trinsic-iframe-parent">
                </main>
              </div>
            </div>
            </div>`;
            window.document.body.insertAdjacentHTML("beforeend", html);
        }
        iframeParent = window.document.getElementById(
            "trinsic-iframe-parent",
        ) as HTMLElement;
        iframeParent.appendChild(iframe);
        MicroModal.show("iframe-modal");
        return iframe;
    }

    public async navigate(params: NavigateParams): Promise<NavigateResponse> {
        this._logger.debug(
            "navigate: Using timeout of:",
            this._timeoutInSeconds,
        );
        const timer = setTimeout(
            () =>
                this._abort.raise(
                    new ErrorTimeout("IFrame timed out without a response"),
                ),
            this._timeoutInSeconds * 1000,
        );
        this._disposeHandlers.add(() => clearTimeout(timer));

        return await super.navigate(params);
    }

    public close(): void {
        if (this._frame) {
            if (this._frame.parentNode) {
                this._frame.addEventListener(
                    "load",
                    (ev) => {
                        const frame = ev.target as HTMLIFrameElement;
                        frame.parentNode?.removeChild(frame);
                        this._abort.raise(new Error("IFrame removed from DOM"));
                    },
                    true,
                );
                this._frame.contentWindow?.location.replace("about:blank");
            }
            this._frame = null;
        }
        this._window = null;
    }

    public static notifyParent(url: string, targetOrigin?: string): void {
        return super._notifyParent(window.parent, url, false, targetOrigin);
    }
}
