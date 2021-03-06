// Copyright (c) Wictor Wilén. All rights reserved.
// Licensed under the MIT license.

import { Middleware, TurnContext } from "botbuilder";
import { ActivityTypesEx, MessagingExtensionQuery, MessagingExtensionResult } from "botbuilder-teams";

/**
 * Defines the processor for the Messaging Extension Middleware
 */
export interface IMessagingExtensionMiddlewareProcessor {
    /**
     * Processes incoming queries (composeExtension/query)
     * @param context the turn context
     * @param value the value of the query
     */
    onQuery?(context: TurnContext, value: MessagingExtensionQuery): Promise<MessagingExtensionResult>;
    /**
     * Process incoming requests for Messaging Extension settings (composeExtension/querySettingUrl)
     * @param context the turn context
     */
    onQuerySettingsUrl?(context: TurnContext): Promise<{ title: string, value: string }>;
    /**
     * Processes incoming setting updates (composeExtension/setting)
     * @param context the turn context
     */
    onSettings?(context: TurnContext): Promise<void>;
    /**
     * Processes incoming link queries (composeExtension/queryLink)
     * @param context the turn context
     * @param value the value of the query
     */
    onQueryLink?(context: TurnContext, value: MessagingExtensionQuery): Promise<MessagingExtensionResult>;
    /**
     * Processes incoming link actions (composeExtension/submitAction)
     * @param context the turn context
     * @param value the value of the query
     */
    onSubmitAction?(context: TurnContext, value: MessagingExtensionQuery): Promise<MessagingExtensionResult>;
}

/**
 * A Messaging Extension Middleware for Microsoft Teams
 */
export class MessagingExtensionMiddleware implements Middleware {

    /**
     * Default constructor
     * @param commandId The commandIf of the Messaging Extension to process,
     *                  or `undefined` to process all incoming requests
     * @param processor The processor
     */
    public constructor(
        private commandId: string | undefined,
        private processor: IMessagingExtensionMiddlewareProcessor) {

    }

    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        switch (context.activity.name) {
            case "composeExtension/query":
                if ((this.commandId === context.activity.value.commandId || this.commandId === undefined) &&
                    this.processor.onQuery) {
                    try {
                        const result = await this.processor.onQuery(context, context.activity.value);
                        context.sendActivity({
                            type: ActivityTypesEx.InvokeResponse,
                            value: {
                                body: {
                                    composeExtension: result,
                                },
                                status: 200,
                            },
                        });
                    } catch (err) {
                        context.sendActivity({
                            type: ActivityTypesEx.InvokeResponse,
                            value: {
                                body: err,
                                status: 500,
                            },
                        });
                    }
                    return;
                }
                break;
            case "composeExtension/querySettingUrl":
                if ((this.commandId === context.activity.value.commandId || this.commandId === undefined) &&
                    this.processor.onQuerySettingsUrl) {
                    try {
                        const result = await this.processor.onQuerySettingsUrl(context);
                        context.sendActivity({
                            type: ActivityTypesEx.InvokeResponse,
                            value: {
                                body: {
                                    composeExtension: {
                                        suggestedActions: {
                                            actions: [{
                                                type: "openApp",
                                                ...result,
                                            }],
                                        },
                                        type: "config",
                                    },
                                },
                                status: 200,
                            },
                        });
                    } catch (err) {
                        context.sendActivity({
                            type: ActivityTypesEx.InvokeResponse,
                            value: {
                                body: err,
                                status: 500,
                            },
                        });
                    }
                    return;
                }
                break;
            case "composeExtension/setting":
                if ((this.commandId === context.activity.value.commandId || this.commandId === undefined) &&
                    this.processor.onSettings) {
                    try {
                        await this.processor.onSettings(context);
                        context.sendActivity({
                            type: ActivityTypesEx.InvokeResponse,
                            value: {
                                status: 200,
                            },
                        });
                    } catch (err) {
                        context.sendActivity({
                            type: ActivityTypesEx.InvokeResponse,
                            value: {
                                body: err,
                                status: 500,
                            },
                        });
                    }
                    return;
                }
                break;
            case "composeExtension/queryLink":
                if ((this.commandId === context.activity.value.commandId || this.commandId === undefined) &&
                    this.processor.onQueryLink) {
                    try {
                        const result = await this.processor.onQueryLink(context, context.activity.value);
                        context.sendActivity({
                            type: ActivityTypesEx.InvokeResponse,
                            value: {
                                body: {
                                    composeExtension: result,
                                },
                                status: 200,
                            },
                        });
                    } catch (err) {
                        context.sendActivity({
                            type: ActivityTypesEx.InvokeResponse,
                            value: {
                                body: err,
                                status: 500,
                            },
                        });
                    }
                    return;
                }
                break;
            case "composeExtension/submitAction":
                if ((this.commandId === context.activity.value.commandId || this.commandId === undefined) &&
                    this.processor.onSubmitAction) {
                    try {
                        const result = await this.processor.onSubmitAction(context, context.activity.value);
                        context.sendActivity({
                            type: ActivityTypesEx.InvokeResponse,
                            value: {
                                body: {
                                    composeExtension: result,
                                },
                                status: 200,
                            },
                        });
                    } catch (err) {
                        context.sendActivity({
                            type: ActivityTypesEx.InvokeResponse,
                            value: {
                                body: err,
                                status: 500,
                            },
                        });
                    }
                    return;
                }
                break;
            default:
                // nop
                break;
        }
        return next();
    }
}
